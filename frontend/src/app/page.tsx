"use client"
import React, { useState, useEffect } from "react";
import UserPrompt from "@/components/UserPrompt";
import ResponseCard from "@/components/ResponseCard";
import WebpageRender from "@/components/WebpageRender";
import { motion, AnimatePresence } from "framer-motion";

interface CodeResponse {
  status: string;
  responses: string[];
}

export default function Home() {
  const [codeResponses, setCodeResponses] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Handle ESC key
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


  const handlePromptSubmit = async (userPrompt: string) => {
    if (!userPrompt?.trim()) {
      alert("Please enter a valid prompt.");
      return;
    }
 
    setLoading(true);
    setStatus(null);
    setCodeResponses([]);
    setExpandedIndex(null);  // Reset expanded state when submitting new prompt

    try {
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

      const codeResponse = await fetch('http://127.0.0.1:5000/api/get-component-code', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ prompt: userPrompt }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const codeData: CodeResponse = await codeResponse.json();
      console.log("Code fetched from backend:", codeData);

      if (codeData.status === "success" && Array.isArray(codeData.responses)) {
        setStatus("success");
        setCodeResponses(codeData.responses);
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
    <main className="min-h-screen bg-gray-100 py-10 px-5 text-black">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          Lee and Thomaz's App
        </h1>
        <h3 className="text-1xl text-center">
          Inspiration powered by <span className="font-bold text-orange-400">Groq</span>
        </h3>

        <div className="max-w-[80%] mx-auto">
          <UserPrompt onSubmit={handlePromptSubmit} />
        </div>

        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-700">Loading...</p>
          </div>
        )}

        {status === "success" && (
          <motion.div
            className="grid grid-cols-2 gap-6 mt-8"
            layout // Enable layout animations on the grid container
          >
            <AnimatePresence>
              {codeResponses.map((webpageCode, index) => (
                <motion.div
                  key={index}
                  layout // Enable layout animations on each card
                  initial={{ opacity: 0, scale: 0.95 }} // Start slightly smaller and invisible
                  animate={{ opacity: 1, scale: 1 }} // Animate to full size and visible
                  exit={{ opacity: 0, scale: 0.95 }} // Shrink slightly and fade out
                  transition={{
                    layout: { duration: 0.3, ease: "easeInOut" }, // Smooth movement
                    default: { duration: 0.2 }, // Opacity and scale transitions
                  }}
                >
                  <ResponseCard 
                    isExpanded={expandedIndex === index}
                    onToggleExpand={(expanded: boolean) => handleToggleExpand(index, expanded)}
                  >
                    <WebpageRender webpageCode={webpageCode} />
                  </ResponseCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {status === "failed" && !loading && (
          <p className="text-center text-red-500 mt-4">
            Failed to fetch responses. Please try again.
          </p>
        )}
      </div>
    </main>
  );
}