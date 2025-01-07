import React, { useState } from 'react';
import { SendHorizonal } from "lucide-react";

function UserPrompt({ onSubmit, placeholder }) {
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
                <div className='flex'>
                    <input
                        type="text"
                        id="userInput"
                        value={inputPrompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="border rounded w-full p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder={placeholder}
                        required
                    />
                    
                    <button
                        type="submit"
                        className="max-w-[30%] mb-4 mx-auto bg-transparent text-black px-4 py-2 rounded hover:text-gray-400 transition-colors"
                    >
                        <SendHorizonal size={20} />
                        <span className='sr-only'>Submit </span>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserPrompt;
