import React, { useState } from 'react';

function UserPrompt({ onSubmit }) {
    const [inputPrompt, setPrompt] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // Trim the input to remove unnecessary whitespace
        const trimmedPrompt = inputPrompt.trim();

        // Check if the input is not empty
        if (trimmedPrompt === "") {
            alert("Please enter a valid prompt.");
            return;
        }

        // Call the onSubmit handler passed from Main.js
        onSubmit(trimmedPrompt);

        setPrompt('');
    };

    return (
        <div className="p-5">
            <form onSubmit={handleSubmit} className="flex flex-col">
                <label htmlFor="userInput" className="block text-lg font-medium mb-2">
                    Enter Your Prompt:
                </label>
                <input
                    type="text"
                    id="userInput"
                    value={inputPrompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="border rounded w-full p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Create a TODO list..."
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}

export default UserPrompt;
