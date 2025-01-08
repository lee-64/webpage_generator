import React, {useState} from 'react';
import {SendHorizonal} from "lucide-react";

export default function UserPrompt({onSubmit, placeholder}) {
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
        <form onSubmit={handleSubmit} className="w-full">
            <div className="relative flex items-center">
                <input
                    type="text"
                    id="userInput"
                    value={inputPrompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full transition-all border border-gray-200 rounded-xl p-3 pr-12 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-gray-300 text-sm"
                    placeholder={placeholder}
                    required
                />
                <button
                    type="submit"
                    className="absolute right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <SendHorizonal size={20}/>
                    <span className="sr-only">Submit</span>
                </button>
            </div>
        </form>
    );
}