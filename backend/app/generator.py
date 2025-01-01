import os
import json
from flask import Flask, request, session, jsonify
from flask_cors import CORS
from groq import Groq


app = Flask(__name__)
app.secret_key = 'dev'

# Configure CORS properly to handle credentials
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],  # Your frontend origin
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# To set Groq API key: export GROQ_API_KEY=______
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)


def load_example_components():
    """Load example components from JSON file"""
    try:
        with open('components.json', 'r') as f:
            data = json.load(f)
            return data.get('todoComponents', [])
    except FileNotFoundError:
        print("Warning: examples.json not found")
        return []
    except json.JSONDecodeError:
        print("Warning: Invalid JSON in examples.json")
        return []


def get_system_context():
    try:
        with open('system-context.txt', 'r') as f:
            return f.read()
    except FileNotFoundError:
        print("Warning: system-context.txt not found")
        return ''


@app.route("/api/get-component-code", methods=['POST'])  # Changed to only POST
def get_component_code():
    data = request.get_json()
    user_prompt = data.get('prompt')

    system_context = get_system_context()

    # TODO Create a boiler plate React component template, given as the "role": "system" context, so that we can gurantee that the React code will compile
    # TODO Add the ability to include photos in llama's response. One way could be to have a dozen images in the repository that llama can pull from.

    # Flag to avoid calling the API to generate a new piece of code when debugging
    dev = False  # Set to False when you want the API to be called. Set to True when you want to use this hardcoded option.
    # This is an extremely ugly solution, but it's just to avoid spamming the Groq API when experimenting for now
    if dev:
        components = load_example_components()
        if components:
            return jsonify({
                "status": "success",
                "responses": [components[0]['code'], 
                              components[1]['code'],
                              components[2]['code'],
                              components[3]['code'],]
            })
        return jsonify({
            "status": "failed",
            "responses": []
        })

    if user_prompt:
        num_responses = 2  # Number of webpages to generate per user prompt
        responses = []
        for _ in range(num_responses):
            chat_completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": system_context
                    },
                    {
                        "role": "user",
                        "content": session.get("user_prompt")
                    },
                    # Prefilling the assistant message to control the output for concise code snippets
                    {
                        "role": "assistant",
                        "content": "```jsx"
                    }
                ],
                stop="```",
                temperature=0.6
            )
            responses.append(chat_completion.choices[0].message.content)

        return jsonify({"status": "success", "responses": responses})

    return jsonify({"status": "failed", "responses": None})


@app.route('/submit', methods=['POST'])
def submit_prompt():
    session.clear()
    data = request.get_json()
    user_prompt = data.get("prompt", 'Create a TODO list')
    session['user_prompt'] = user_prompt
    
    return jsonify({'message': f'Input {user_prompt} was received successfully'})


if __name__ == "__main__":
    app.run(debug=True)
