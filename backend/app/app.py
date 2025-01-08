import os
import json
import random
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from groq_optimizer import router as optimizer_router

load_dotenv()

app = FastAPI()

# Flag to toggle between development and production
dev = False

# Development
if dev:
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    except Exception as e:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://useforgeui.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

def load_example_components():
    """Load example components from JSON file"""
    try:
        with open('components.json', 'r') as f:
            data = json.load(f)
            return data.get('todoComponents', [])
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Warning: Error loading components.json - {str(e)}")
        return []

def generate_template():
    """Load and generate random style template"""
    try:
        with open('styles.json', 'r') as f:
            styles = json.load(f)
            style_name = random.choice(list(styles["styles"].keys()))
            style = styles["styles"][style_name]
            return f'''function Card() {{ 
                return (
                <div className="{style["container"]}">
                    <h2 className="{style["title"]}">Title</h2>
                </div>
                );
                }}'''
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Warning: Error loading styles.json - {str(e)}")
        return ''

def get_system_context():
    """Get system context with template"""
    try:
        with open('sys-ctxt.txt', 'r') as f:
            ctx = f.read()
            return ctx.replace("<<replace_here>>", generate_template())
    except FileNotFoundError:
        print("Warning: sys-ctxt.txt not found")
        return ''

class PromptRequest(BaseModel):
    prompt: str

class ConfigRequest(BaseModel):
    numResponses: int = 2
    modelSize: str = "70B"
    apiKey: str

@app.post('/api/submit')
async def submit_prompt(data: PromptRequest):
    return {"message": f'Input {data.prompt} was received successfully'}

@app.post('/api/submit-config')
async def submit_config(data: ConfigRequest, request: Request):
    request.app.state.num_responses = data.numResponses
    request.app.state.model_type = data.modelSize

    if not dev:
        try:
            request.app.state.groq_client = Groq(api_key=data.apiKey)
        except Exception as e:
            print("Invalid Groq API key:", e)
            return {"status": "failed", "message": "Invalid Groq API key"}

    return {"status": "success", "message": "Config was received successfully"}

# Include the optimizer routes
app.include_router(optimizer_router)

if __name__ == "__main__":
    import uvicorn
    import socket
    
    def find_free_port(start_port=8000):
        """Find a free port to bind to, starting from start_port"""
        port = start_port
        while port < start_port + 100:
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('127.0.0.1', port))
                    return port
            except OSError:
                port += 1
        raise RuntimeError("Could not find a free port")
    
    port = find_free_port(5000)
    print(f"\n🚀 Server starting on port {port}")
    print(f"📍 Access the API at http://localhost:{port}")
    print("Press CTRL+C to quit\n")
    
    uvicorn.run(app, host="127.0.0.1", port=port)