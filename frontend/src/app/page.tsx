"use client";
import React, { useState, useEffect } from "react";
import UserPrompt from "@/components/UserPrompt";
import ResponseCard from "@/components/ResponseCard";
import WebpageRender from "@/components/WebpageRender";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedTitle from '@/components/AnimatedTitle';

interface CodeResponse {
  status: string;
  responses: string[];
}

export default function Home() {
  const [codeResponses, setCodeResponses] = useState<string[]>([]);
  const [messageHistory, setMessageHistory] = useState<Array<{role: string, content: string}>>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpandedIndex(null);
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

  const handlePromptSubmit = async (userPrompt: string) => {
    if (!userPrompt?.trim()) {
      alert("Please enter a valid prompt.");
      return;
    }

    setLoading(true);
    setStatus(null);
    setCodeResponses([]);
    setExpandedIndex(null);

    try {
      // First API call to submit the prompt
      const submitResponse = await fetch('http://127.0.0.1:5000/submit', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ prompt: userPrompt }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const submitData = await submitResponse.json();
      console.log('Submit response:', submitData);

      // Second API call to get the component code
      const codeResponse = await fetch('http://127.0.0.1:5000/api/get-component-code', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          prompt: userPrompt,
          selectedCode: selectedCode,
          messageHistory: messageHistory
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
    <main className="min-h-screen bg-gray-100 py-10 px-5 text-black">
      <div className="max-w-7xl mx-auto">
        <AnimatedTitle />

        {status !== "success" && !loading && (
          <div className="h-[70vh] flex flex-col justify-center items-center">
            <div className="w-[80%] max-w-3xl">
              <label htmlFor="userInput" className="block text-lg font-medium mb-2">
                Enter Your Prompt:
              </label>
              <UserPrompt onSubmit={handlePromptSubmit} placeholder="Create a TODO list..." />
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex justify-center items-center space-x-2">
              <motion.div
                className="w-2.5 h-2.5 bg-gray-700 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
              />
              <motion.div
                className="w-2.5 h-2.5 bg-gray-700 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }}
              />
              <motion.div
                className="w-2.5 h-2.5 bg-gray-700 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }}
              />
            </div>
          </div>
        )}

        {status === "success" && (
          <motion.div
            className="space-y-6 mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-2xl font-semibold text-center mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Which response do you prefer?
            </motion.h2>
            <motion.p
              className="text-gray-600 text-center mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Click your choice and refine your prompt below.
            </motion.p>

            <motion.div className="grid grid-cols-2 gap-4" layout>
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

            <motion.div
              className="w-full max-w-3xl mx-auto mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <UserPrompt onSubmit={handlePromptSubmit} placeholder="Refine your selection..." />
            </motion.div>
          </motion.div>
        )}

        {status === "failed" && !loading && (
          <p className="text-center text-red-500 mt-4">
            Failed to fetch responses. Please try again.
          </p>
        )}

        {/* Show prompt at bottom when loading after success */}
        {loading && status === "success" && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-5">
            <UserPrompt onSubmit={handlePromptSubmit} placeholder="Refine your selection..." />
          </div>
        )}
      </div>
    </main>
  </div>
);
}