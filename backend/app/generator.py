import os
import json
import random
from flask import Flask, request, session, jsonify
from flask_cors import CORS, cross_origin
from groq import Groq
from dotenv import load_dotenv

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

# To set Groq API key: export GROQ_API_KEY=______ in env
load_dotenv()
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


def generate_template():
    """Load example components from JSON file"""
    try:
        with open('styles.json', 'r') as f:
            styles = json.load(f)
    except FileNotFoundError:
        print("Warning: styles.json not found")
    except json.JSONDecodeError:
        print("Warning: Invalid JSON in styles.json")

    # Get random style choice
    style_name = random.choice(list(styles["styles"].keys()))
    style = styles["styles"][style_name]

    template = f'''function Card() {{ 
    return (
    <div className="{style["container"]}">
        <h2 className="{style["title"]}">Title</h2>
    </div>
    );
    }}'''

    return template


def get_system_context():
    try:
        with open('sys-ctxt.txt', 'r') as f:
            ctx = f.read()
            return ctx.replace("<<replace_here>>", generate_template())
    except FileNotFoundError:
        print("Warning: sys-ctxt.txt not found")
        return ''


@app.route("/api/get-component-code", methods=['POST'])
@cross_origin(supports_credentials=True)
def get_component_code():
    data = request.get_json()
    user_prompt = data.get('prompt')
    selected_code = data.get('selectedCode', None)
    message_history = data.get('messageHistory', [])

    # Flag to avoid calling the API to generate a new piece of code when debugging
    # Set to False when you want the API to be called. Set to True when you want to use this hardcoded option.
    dev = False
    if dev:
        components = load_example_components()
        if components:
            return jsonify({
                "status": "success",
                "responses": [components[0]['code'],
                              # components[1]['code'],
                              # components[2]['code'],
                              components[3]['code'], ]
            })
        return jsonify({
            "status": "failed",
            "responses": []
        })

    # TODO: Make parallel api calls to speed up the response time. Look into speeding it up further through Groq console.
    if user_prompt:
        num_responses = 2  # Number of webpages to generate per user prompt
        responses = []

        # If the user has selected a generated response, add it to the message history
        if selected_code:
            message_history.append({
                "role": "assistant",
                "content": f"```jsx\n{selected_code}\n```",
            })
            # Add a system message to guide towards similar style
            message_history.append({
                "role": "system",
                "content": "Generate a response similar in style and structure to the user's previous response, iterating and improving where requested."
            })

        # Add the new user prompt
        message_history.append({
            "role": "user",
            "content": user_prompt
        })

        # Generate responses
        for _ in range(num_responses):
            chat_completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": get_system_context()
                    },
                    *message_history,
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

        return jsonify({"status": "success",
                        "responses": responses,
                        "messageHistory": message_history  # Return updated history
                        })

    return jsonify({"status": "failed",
                    "responses": None,
                    "messageHistory": message_history
                    })


@app.route('/submit', methods=['POST'])
@cross_origin(supports_credentials=True)
def submit_prompt():
    session.clear()
    data = request.get_json()
    user_prompt = data.get("prompt", 'Create a TODO list')
    session['user_prompt'] = user_prompt

    return jsonify({'message': f'Input {user_prompt} was received successfully'})


if __name__ == "__main__":
    app.run(debug=True)
