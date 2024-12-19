import os
import json
from flask import Flask, request, session, jsonify
from flask_cors import CORS
# from groq import Groq




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
# # To set Groq API key: export GROQ_API_KEY=____
# client = Groq(
#     api_key=os.environ.get("GROQ_API_KEY"),
# )

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


@app.route("/api/get-component-code", methods=['POST'])  # Changed to only POST
def get_component_code():
    data = request.get_json()
    user_prompt = data.get('prompt')
    # TODO Create a boiler plate React component template, given as the "role": "system" context, so that we can gurantee that the React code will compile
    # TODO Add the ability to include photos in llama's response. One way could be to have a dozen images in the repository that llama can pull from.

    # Flag to avoid calling the API to generate a new piece of code when debugging
    dev = True  # Set to False when you want the API to be called. Set to True when you want to use this hardcoded option.
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
        num_responses = 2
        responses = []
        for _ in range(num_responses):
            chat_completion = client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {
                        "role": "system",
                        "content": "Create a standalone React webpage with all components contained in a single file. Do not include any import statements or comments in your code. Use only React and useState, and their inclusion is implied. Begin with the function declaration, ensure all curly brackets are properly closed after the return statement, and always end with export default followed by the function name. Apply Tailwind CSS styling to achieve a sleek, modern design with a high level of attention to detail. Use className parameters to style React components, incorporating a thoughtful and aesthetically pleasing palette of colors, gradients, and shadows. Pay careful attention to spacing, typography, and responsiveness to create a visually polished and user-friendly interface. Add hover effects, smooth transitions, and subtle animations where appropriate to enhance the user experience."
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
                temperature=1
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