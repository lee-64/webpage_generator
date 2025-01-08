import os
import json
import random
from flask import Flask, request, session, jsonify
from flask_cors import CORS, cross_origin
from groq import Groq
from dotenv import load_dotenv
from groq_optimizer import setup_optimized_routes  # Updated import

app = Flask(__name__)
load_dotenv()

# Configure session
app.config['SESSION_TYPE'] = 'filesystem'
if os.getenv("FLASK_SECRET_KEY"):
    app.secret_key = os.getenv("FLASK_SECRET_KEY")
else:
    app.secret_key = 'dev-key-1234'

# Flag to toggle between development and production
dev = False

# Development
if dev:
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    except Exception as e:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
else:
    app.secret_key = os.getenv("FLASK_SECRET_KEY", "prod-key-5678")

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "https://useforgeui.vercel.app/"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

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

@app.route('/api/submit', methods=['POST'])
@cross_origin(supports_credentials=True)
def submit_prompt():
    data = request.get_json()
    user_prompt = data.get("prompt", 'Create a TODO list')
    return jsonify({'message': f'Input {user_prompt} was received successfully'})

@app.route('/api/submit-config', methods=['POST'])
@cross_origin(supports_credentials=True)
def submit_config():
    session.clear()
    model_config = request.get_json()
    
    session["num_responses"] = model_config.get("numResponses", 2)
    session["model_type"] = model_config.get("modelSize", "70B")

    if not dev:
        try:
            app.config["GROQ_CLIENT"] = Groq(api_key=model_config.get("apiKey", ""))
        except Exception as e:
            print("Invalid Groq API key:", e)
            return jsonify({"status": "failed", "message": "Invalid Groq API key"})

    return jsonify({"status": "success", "message": "Config was received successfully"})

# Setup optimized routes
setup_optimized_routes(app)

if __name__ == "__main__":
    from hypercorn.config import Config
    from hypercorn.asyncio import serve
    import asyncio
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
    
    config = Config()
    config.bind = [f"127.0.0.1:{port}"]
    config.worker_class = "asyncio"
    
    try:
        asyncio.run(serve(app, config))
    except KeyboardInterrupt:
        print("\n👋 Shutting down server...")