import asyncio
import aiohttp
from flask import request, jsonify, current_app, session
from flask_cors import cross_origin
from aiohttp import ClientTimeout
import time
from groq import AsyncGroq  # Add this import at the top

class GroqOptimizer:
    def __init__(self, timeout_seconds=30):
        self.timeout = timeout_seconds
        self.retry_delays = [0.1, 0.5, 1]  # Retry delays in seconds
        
    async def make_request(self, messages, model_type, api_key, retry_count=0):
        """Make a single request with retry logic"""
        try:
            client = AsyncGroq(api_key=api_key)
            
            response = await client.chat.completions.create(
                model=model_type,
                messages=messages,
                stop=["```"],
                temperature=0.6
            )
            
            return response.choices[0].message.content
                
        except Exception as e:
            if retry_count < len(self.retry_delays):
                await asyncio.sleep(self.retry_delays[retry_count])
                return await self.make_request(messages, model_type, api_key, retry_count + 1)
            print(f"Request failed: {str(e)}")
            return None

    async def batch_requests(self, messages, num_responses, model_type, api_key):
        """Process multiple requests in optimal batches"""
        tasks = []
        batch_size = min(int(num_responses), 5)  # Limit concurrent requests
        
        for i in range(0, int(num_responses), batch_size):
            batch_tasks = [
                self.make_request(messages, model_type, api_key)
                for _ in range(min(batch_size, int(num_responses) - i))
            ]
            batch_results = await asyncio.gather(*batch_tasks)
            tasks.extend(batch_results)
            
            if i + batch_size < int(num_responses):
                await asyncio.sleep(0.1)  # Small delay between batches
                
        return [r for r in tasks if r is not None]

def setup_optimized_routes(app):
    @app.route("/api/get-component-code", methods=['POST'])
    @cross_origin(supports_credentials=True)
    def get_component_code():
        from generator import dev, get_system_context
        
        start_time = time.time()
        
        if not dev:
            client = current_app.config.get("GROQ_CLIENT")
        else:
            from generator import client

        data = request.get_json()
        user_prompt = data.get("prompt")
        
        if not user_prompt:
            return jsonify({"status": "failed", "responses": None, "messageHistory": []})

        num_responses = session.get("num_responses", "2")
        model_type = "llama-3.3-70b-versatile" if session.get("model_type", "70B") == "70B" else "llama-3.1-8b-instant"
        selected_code = data.get('selectedCode')
        message_history = data.get('messageHistory', [])

        messages = [
            {"role": "system", "content": get_system_context()},
            *message_history
        ]

        if selected_code:
            messages.extend([
                {"role": "assistant", "content": f"```jsx\n{selected_code}\n```"},
                {"role": "system", "content": "Generate a response similar in style and structure to the user's previous response, iterating and improving where requested."}
            ])

        messages.append({"role": "user", "content": user_prompt})
        messages.append({"role": "assistant", "content": "```jsx"})

        # Execute optimized batch requests
        async def process_requests():
            async with GroqOptimizer() as optimizer:
                return await optimizer.batch_requests(messages, num_responses, model_type, client.api_key)

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            responses = loop.run_until_complete(process_requests())
        finally:
            loop.close()

        end_time = time.time()
        print(f"⚡ Batch processed in {end_time - start_time:.2f} seconds")
        
        if not responses:
            return jsonify({
                "status": "failed",
                "responses": None,
                "messageHistory": message_history
            })

        return jsonify({
            "status": "success",
            "responses": responses,
            "messageHistory": message_history
        })