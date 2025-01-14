"use client";
import React, {useState, useEffect} from 'react';
import { SendHorizonal, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

interface UserPromptProps {
    onSubmit: (prompt: string) => void;
    placeholder: string;
    apiKey: string;
    invalidOverride?: boolean; 
}

export default function UserPrompt({
    onSubmit, 
    placeholder, 
    apiKey, 
    invalidOverride
}: UserPromptProps) {
    const [inputPrompt, setPrompt] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);

    useEffect(() => {
        if (invalidOverride !== undefined) {
            setIsInvalid(invalidOverride);
            if (invalidOverride) {
                const timer = setTimeout(() => setIsInvalid(false), 2500);
                return () => clearTimeout(timer);
            }
        }
    }, [invalidOverride]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const trimmedPrompt = inputPrompt.trim();

        if (trimmedPrompt === "") {
            alert("Please enter a valid prompt.");
            return;
        }

        if (!apiKey?.trim()) {
            setIsInvalid(true);
            setTimeout(() => setIsInvalid(false), 2500);
            return;
        }

        onSubmit(trimmedPrompt);
        setPrompt('');
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-2">
                <AnimatePresence>
                    {isInvalid && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                    >
                        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-sm">Please add your API key in the config menu.</p>
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative">
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <SendHorizonal size={20}/>
                        <span className="sr-only">Submit</span>
                    </button>
                </div>
            </div>
        </form>
    );
}