import os
from flask import Flask, request, session, jsonify
from groq import Groq

app = Flask(__name__)
app.secret_key = 'dev'

# To set Groq API key: export GROQ_API_KEY=____
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)


@app.route("/api/get-component-code")
def get_component_code():
    # TODO Create a boiler plate React component template, given as the "role": "system" context, so that we can gurantee that the React code will compile
    # TODO Add the ability to include photos in llama's response. One way could be to have a dozen images in the repository that llama can pull from.

    # Flag to avoid calling the API to generate a new piece of code when debugging
    dev = False  # Set to False when you want the API to be called. Set to True when you want to use this hardcoded option.
    # This is an extremely ugly solution, but it's just to avoid spamming the Groq API when experimenting for now
    if dev:
        responses = list()
        responses.append("""
            export default function App() {
              const [addItem, setAddItem] = useState("");
              const [shoppingList, setShoppingList] = useState([]);
              const [editItem, setEditItem] = useState({});
            
              const handleSubmit = (e) => {
                e.preventDefault();
                setShoppingList([...shoppingList, addItem]);
                setAddItem("");
              };
            
              const handleDelete = (index) => {
                setShoppingList(shoppingList.filter((item, i) => i !== index));
              };
            
              const handleEdit = (index) => {
                setEditItem({ ...shoppingList[index] });
              };
            
              const handleUpdate = (index, value) => {
                const updatedList = shoppingList.map((item, i) => {
                  if (i === index) {
                    return value;
                  }
                  return item;
                });
                setShoppingList(updatedList);
                setEditItem({});
              };
            
              return (
                <div className="w-full h-screen flex justify-center overflow-hidden bg-gray-200">
                  <div className="w-3/4 h-full bg-white shadow-md rounded-t-md overflow-hidden">
                    <h1 className="text-3xl font-bold text-gray-800 pt-6">Shopping List</h1>
                    <form className="w-full mt-6" onSubmit={handleSubmit}>
                      <input
                        type="text"
                        className="w-full h-12 pl-4 pt-1 text-gray-700 focus:outline-none focus:border-blue-700"
                        value={addItem}
                        onChange={(e) => setAddItem(e.target.value)}
                        placeholder="Add item to your shopping list"
                      />
                      <button
                        type="submit"
                            className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md"
                      >
                        Add
                      </button>
                    </form>
                    <ul className="w-full h-screen overflow-y-scroll p-6">
                      {shoppingList.map((item, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center py-4 border-b border-gray-300"
                        >
                          {editItem.index === index ? (
                            <input
                              type="text"
                              className="w-full h-12 pl-4 pt-1 text-gray-700 focus:outline-none focus:border-blue-700"
                              value={editItem.value}
                              onChange={(e) => handleUpdate(index, e.target.value)}
                            />
                          ) : (
                            <span className="w-full truncate">{item}</span>
                          )}
                          <span className="text-gray-600">
                            {editItem.index === index ? (
                              <i className="fa fa-check"></i>
                            ) : (
                              <button
                                onClick={() => handleEdit(index)}
                                className="bg-transparent hover:bg-blue-700 text-blue-600 font-bold py-1 px-2 rounded-md"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(index)}
                              className="bg-transparent hover:bg-red-700 text-red-600 font-bold py-1 px-2 rounded-md"
                            >
                              Delete
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            }
        """)
        return responses

    if session.get("user_prompt"):
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
    user_prompt = data.get("userPrompt", 'Create a TODO list')  # Create a to-do list is a placeholder if the user doesn't input anything
    # print(f'Received user input: {user_prompt}')

    session['user_prompt'] = user_prompt

    response_message = f'Input {user_prompt} was received successfully'
    return jsonify({'message': response_message})


if __name__ == "__main__":
    app.run(debug=True)