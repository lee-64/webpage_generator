from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import time
import asyncio
from groq import AsyncGroq

class RequestData(BaseModel):
    prompt: str
    selectedCode: Optional[str] = None
    messageHistory: List[Dict] = []

class GroqOptimizer:
    def __init__(self, timeout_seconds=30):
        self.timeout = timeout_seconds
        self.retry_delays = [0.1, 0.5, 1]
        self.client = None
        
    async def make_request(self, user_messages, model_type, api_key, retry_count=0):
        """Make a single request with retry logic"""
        try:
            if not self.client:
                self.client = AsyncGroq(api_key=api_key)
            
            # Get fresh system context for each request
            from app import get_system_context
            messages = [
                {"role": "system", "content": get_system_context()},
                *user_messages
            ]
            
            response = await self.client.chat.completions.create(
                model=model_type,
                messages=messages,
                stop=["```"],
                temperature=0.6
            )
            
            return response.choices[0].message.content
                
        except Exception as e:
            if retry_count < len(self.retry_delays):
                await asyncio.sleep(self.retry_delays[retry_count])
                return await self.make_request(user_messages, model_type, api_key, retry_count + 1)
            print(f"Request failed: {str(e)}")
            return None

    async def batch_requests(self, user_messages, num_responses, model_type, api_key):
        """Process multiple requests in optimal batches"""
        tasks = []
        batch_size = min(int(num_responses), 5)
        
        for i in range(0, int(num_responses), batch_size):
            batch_tasks = [
                self.make_request(user_messages, model_type, api_key)
                for _ in range(min(batch_size, int(num_responses) - i))
            ]
            batch_results = await asyncio.gather(*batch_tasks)
            tasks.extend(batch_results)
            
            if i + batch_size < int(num_responses):
                await asyncio.sleep(0.1)
                
        return [r for r in tasks if r is not None]

router = APIRouter()

@router.post("/api/get-component-code")
async def get_component_code(
    request: Request,
    data: RequestData
):
    from app import dev, get_system_context
    
    start_time = time.time()
    
    if not dev:
        client = request.app.state.groq_client
    else:
        from app import client

    if not data.prompt:
        return JSONResponse({
            "status": "failed",
            "responses": None,
            "messageHistory": []
        })

    num_responses = request.app.state.num_responses if hasattr(request.app.state, 'num_responses') else "2"
    model_type = "llama-3.3-70b-versatile" if getattr(request.app.state, 'model_type', "70B") == "70B" else "llama-3.1-8b-instant"
    
    # Create base messages without system context
    messages = []

    if data.selectedCode:
        messages.extend([
            {"role": "assistant", "content": f"```jsx\n{data.selectedCode}\n```"},
            {"role": "system", "content": "Generate a response similar in style and structure to the user's previous response, iterating and improving where requested."}
        ])

    # Add message history and user prompt
    messages.extend(data.messageHistory)
    messages.append({"role": "user", "content": data.prompt})
    messages.append({"role": "assistant", "content": "```jsx"})

    optimizer = GroqOptimizer()
    responses = await optimizer.batch_requests(messages, num_responses, model_type, client.api_key)

    end_time = time.time()
    print(f"⚡ Batch processed in {end_time - start_time:.2f} seconds")
    
    if not responses:
        return JSONResponse({
            "status": "failed",
            "responses": None,
            "messageHistory": data.messageHistory
        })

    return JSONResponse({
        "status": "success",
        "responses": responses,
        "messageHistory": data.messageHistory
    })