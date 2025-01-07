import React, { useState } from 'react';
import { SendHorizonal } from "lucide-react";

function UserPrompt({ onSubmit, placeholder, isSuggesting }) {
    const suggestedPrompts = [
        { text: "Shimmer skeleton loader", href: "#" },
        { text: "Create a login component", href: "#" },
        { text: "Make a product card with tilt hover", href: "#" }
       ]
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
            <form onSubmit={handleSubmit} className="flex flex-col mb-4">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        id="userInput"
                        value={inputPrompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 transition-all border border-gray-200 rounded-xl p-3 pr-12 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-gray-300 text-sm"
                        placeholder={placeholder}
                        required
                    />
                    <button
                        type="submit"
                        className="absolute right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <SendHorizonal size={20} />
                        <span className="sr-only">Submit</span>
                    </button>
                </div>
            </form>
            
            {isSuggesting && (
            <div className="flex flex-wrap justify-center gap-2 mt-2">
            {suggestedPrompts.map((prompt, index) => (
                <button
                    key={index}
                    onClick={() => onSubmit(prompt.text)}
                    className="px-4 py-2 bg-gray-50 text-gray-600 text-sm rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                >
                    {prompt.text}
                </button>
            ))}
            </div>
            )}
        </div>
    );
}

export default UserPrompt;
