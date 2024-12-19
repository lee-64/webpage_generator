import React, { useState } from "react";
import axios from "axios";
import WebpageRender from "./components/WebpageRender";
import ResponseCard from "./components/ResponseCard";
import UserPrompt from "./components/UserPrompt";
import './tailwind.css';

function Main() {
    const [codeResponses, setCodeResponses] = useState([]);
    const [status, setStatus] = useState(null);  // Status of API get-component-code response
    const [loading, setLoading] = useState(false);  // Loading state

    // Handler function to manage prompt submission
    const handlePromptSubmit = async (userPrompt) => {
        if (!userPrompt || userPrompt.trim() === "") {
            alert("Please enter a valid prompt.");
            return;
        }

        setLoading(true);
        setStatus(null); // Reset status
        setCodeResponses([]); // Clear previous responses

        try {
            // Submit the user prompt to the backend
            const submitResponse = await axios.post("/submit", { userPrompt }, { withCredentials: true });
            console.log(submitResponse.data.message);

            // Fetch the code responses after successful submission
            const codeResponse = await axios.get("/api/get-component-code", { withCredentials: true });
            console.log("Code fetched from backend:", codeResponse.data);

            const { status, responses } = codeResponse.data;
            console.log("Status:", status);
            setStatus(status);

            if(status === "success") {
                setCodeResponses(responses);
            } else {
                setCodeResponses([]);
            }
        } catch (error) {
            console.error("Error processing the prompt:", error);
            setStatus("failed");
            setCodeResponses([]);
            alert("There was an error processing your request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="min-h-screen bg-gray-100 py-10 px-5">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8">Lee and Thomaz's App</h1>

                    {/* Pass the handler to UserPrompt */}
                    <UserPrompt onSubmit={handlePromptSubmit} />

                    {/* Display a loading indicator */}
                    {loading && <p className="text-center text-gray-700">Loading...</p>}

                    {/* Conditionally render ResponseCards based on status */}
                    {status === "success" && (
                        <div className="grid gap-6 grid-cols-1 grid-rows-2 mt-8">
                            {codeResponses.map((webpageCode, index) => (
                                <ResponseCard key={index}>
                                    <WebpageRender
                                        webpageCode={webpageCode}
                                    />
                                </ResponseCard>
                            ))}
                        </div>
                    )}

                    {status === "failed" && !loading && (
                        <p className="text-center text-red-500 mt-4">Failed to fetch responses. Please try again.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Main;
