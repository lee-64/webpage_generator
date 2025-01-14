"use client";
import React, { useState, useEffect, use } from "react";
import UserPrompt from "@/components/UserPrompt";
import ResponseCard from "@/components/ResponseCard";
import WebpageRender from "@/components/WebpageRender";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedTitle from '@/components/AnimatedTitle';
import ForgeLoading from '@/components/ForgeLoading';
import { ConfigButton, ConfigMenu } from '@/components/ConfigMenu';

interface CodeResponse {
    status: string;
    responses: string[];
}

interface ConfigState {
    numResponses: number;
    modelSize: '8B' | '70B';
    apiKey: string;
}

export default function Home() {
    const [codeResponses, setCodeResponses] = useState<string[]>([]);
    const [messageHistory, setMessageHistory] = useState<Array<{role: string, content: string}>>([]);
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isInvalidSubmit, setIsInvalidSubmit] = useState(false);
    const [configState, setConfigState] = useState<ConfigState>({
        numResponses: 2,
        modelSize: '70B',
        apiKey: ''
    });

    const suggestedPrompts = [
        {text: "Generate a skeleton loader", href: "#"},
        {text: "Create a login component", href: "#"},
        {text: "Make a product card", href: "#"}
    ]

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setExpandedIndex(null);
                setIsConfigOpen(false);
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const handleToggleExpand = (index: number, expanded: boolean) => {
        setExpandedIndex(expanded ? index : null);
    };

    const handleCodeSelection = (code: string, index: number) => {
        setSelectedCode(code);
        setSelectedIndex(index);
    };

    const handleConfigUpdate = (updates: Partial<ConfigState>) => {
        setConfigState(prev => ({
            ...prev,
            ...updates
        }));
    };

    const saveConfig = async () => {
        try {
            const response = await fetch('/api/submit-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(configState)
            });

            if (!response.ok) {
                throw new Error('Failed to save configuration');
            }

            const data = await response.json();
            if (data.message) {
                console.log('Configuration saved:', data.message);
            }
        } catch (error) {
            console.error('Error saving configuration:', error);
        }
    };

    const handlePromptSubmit = async (userPrompt: string) => {
        if (!userPrompt?.trim()) {
            alert("Please enter a valid prompt.");
            return;
        }

        if (!configState.apiKey?.trim()) {
            setIsInvalidSubmit(true)
            const timer = setTimeout(() => setIsInvalidSubmit(false), 3000);
            return () => clearTimeout(timer);
        }

        setLoading(true);
        setStatus(null);
        setCodeResponses([]);
        setExpandedIndex(null);

        try {
            // First API call to submit the prompt
            const submitResponse = await fetch('/api/submit', {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({
                    prompt: userPrompt,
                    config: configState
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const submitData = await submitResponse.json();
            console.log('Submit response:', submitData);

            // Second API call to get the component code
            const codeResponse = await fetch('/api/get-component-code', {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({
                    prompt: userPrompt,
                    selectedCode: selectedCode,
                    messageHistory: messageHistory,
                    config: configState
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const codeData: CodeResponse & { messageHistory?: Array<{role: string, content: string}> } = await codeResponse.json();
            console.log("Code fetched from backend:", codeData);

            if (codeData.status === "success" && Array.isArray(codeData.responses)) {
                setStatus("success");
                setCodeResponses(codeData.responses);
                if (codeData.messageHistory) {
                    setMessageHistory(codeData.messageHistory);
                }
                // Reset selection when new responses arrive
                setSelectedCode(null);
                setSelectedIndex(null);
            } else {
                setStatus("failed");
                setCodeResponses([]);
            }
        } catch (error) {
            console.error("Error processing the prompt:", error);
            setStatus("failed");
            setCodeResponses([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 font-quicksand-700">
            <main className="min-h-screen bg-gray-100 py-10 px-5 text-black relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className={`flex flex-col justify-center items-center ${status === "success" ? "top-0 left-0 w-full z-50" : ""}`}
                        initial={{ y: 0 }}
                        animate={{ y: status === "success" ? -40 : 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ paddingTop: status === "success" ? '3rem' : '25vh' }}
                    >
                        <AnimatedTitle />
                    </motion.div>

                    {status !== "success" && !loading && (
                        <div className="flex flex-col items-center max-w-3xl mx-auto">
                            <div className="w-full flex items-start pl-2">
                                <div className="flex-1">
                                    <div className="w-full">
                                        <UserPrompt
                                            onSubmit={handlePromptSubmit}
                                            placeholder="Generate React components 3.8x faster than Claude and v0..."
                                            apiKey={configState.apiKey}
                                            invalidOverride={isInvalidSubmit}
                                        />
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                                        {suggestedPrompts.map((prompt, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handlePromptSubmit(prompt.text)}
                                                className="px-4 py-2 bg-gray-50 text-gray-600 text-sm rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                                            >
                                                {prompt.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <ConfigButton onClick={() => setIsConfigOpen(true)} />
                            </div>
                        </div>
                    )}

                    {/* Just displaying the loading animation */}
                    {loading && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="flex justify-center items-center space-x-2 pt-10">
                                <ForgeLoading/>
                            </div>
                        </div>
                    )}

                    {/* Show prompt at bottom when loading following the initial successful response */}
                    {loading && status === "success" && (
                        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-5 relative">
                            <UserPrompt 
                                onSubmit={handlePromptSubmit}
                                placeholder="Refine your selection..."
                                apiKey={configState.apiKey}
                            />
                        </div>
                    )}

                    {status === "success" && (
                        <motion.div
                            className="mb-6 mx-2 md:mx-8 lg:mx-20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.div  className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-2 md:px-4" layout>
                                <AnimatePresence>
                                    {codeResponses.map((webpageCode, index) => (
                                        <motion.div
                                            key={index}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{
                                                layout: { duration: 0.3, ease: "easeInOut" },
                                                default: { duration: 0.2 },
                                            }}
                                            onClick={() => handleCodeSelection(webpageCode, index)}
                                        >
                                            <ResponseCard
                                                isExpanded={expandedIndex === index}
                                                onToggleExpand={(expanded: boolean) => handleToggleExpand(index, expanded)}
                                                generatedCode={webpageCode}
                                                isSelected={selectedIndex === index}
                                                onSelect={() => handleCodeSelection(webpageCode, index)}
                                            >
                                                <WebpageRender webpageCode={webpageCode} />
                                            </ResponseCard>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            <motion.p
                                className="text-center text-sm my-4 font-quicksand-600 text-gray-500"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Click your choice and refine your result with a prompt below.
                            </motion.p>

                            <motion.div
                                className="w-full max-w-3xl mx-auto mt-8 relative"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <UserPrompt 
                                    onSubmit={handlePromptSubmit} 
                                    placeholder="Refine your selection..."
                                    apiKey={configState.apiKey}
                                />
                            </motion.div>
                        </motion.div>
                    )}

                    {status === "failed" && !loading && (
                        <p className="text-xs text-center text-red-500 mt-4">
                            Failed to fetch responses. Please check your Groq API key and try again.
                        </p>
                    )}
                </div>
            </main>
            <footer className="w-full bg-gray-100 pb-4 relative bottom-10 left-0">
                <div className="flex justify-center items-center">
                    <p className="text-xs font-quicksand-600 text-zinc-600">
                        Made with ❤️ by <a className="underline" href="https://lee-64.github.io/">Lee</a> & <a className="underline" href="https://thomazbonato.vercel.app/">Tom</a> — <a className="underline" href="https://github.com/lee-64/webpage_generator.git">GitHub</a>
                    </p>
                </div>
            </footer>

            <ConfigMenu
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                sliderValue={configState.numResponses}
                setSliderValue={(value: number) => handleConfigUpdate({ numResponses: value })}
                modelSize={configState.modelSize}
                setModelSize={(size: '8B' | '70B') => handleConfigUpdate({ modelSize: size })}
                apiKey={configState.apiKey}
                setApiKey={(value: string) => handleConfigUpdate({ apiKey: value })}
                onSave={saveConfig}
            />
        </div>
    );
}