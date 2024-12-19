import React, { useEffect, useState } from "react";
import * as Babel from "@babel/standalone";

function WebpageRender({ webpageCode }) {
    const [Component, setComponent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!webpageCode) {
            console.log("No webpage code provided");
            return;
        }

        const loadComponent = () => {
            try {
                const codeWithoutExport = webpageCode
                    .replace('export default', '')
                    .trim();

                const transpiledCode = Babel.transform(codeWithoutExport, {
                    presets: ["react"],
                    filename: 'dynamic.js',
                }).code;

                const func = new Function(
                    'React', 
                    'useState',
                    `
                        return ${transpiledCode};
                    `
                );

                const LoadedComponent = func(React, React.useState);

                if (!LoadedComponent) {
                    throw new Error("Component failed to load");
                }

                setComponent(() => LoadedComponent);
                setError(null);
            } catch (err) {
                console.error("Error loading component:", err);
                setError(err.toString());
            }
        };

        loadComponent();
    }, [webpageCode]);

    useEffect(() => {
        // Add escape key handler
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                const overlay = document.querySelector('.modal-overlay');
                if (overlay) {
                    overlay.click();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    if (error) {
        return (
            <div className="p-4 border border-red-500 rounded bg-red-50">
                <h3 className="text-red-600 font-bold">Error loading component:</h3>
                <pre className="mt-2 text-sm text-red-500 whitespace-pre-wrap">
                    {error}
                </pre>
                <div className="mt-4">
                    <h4 className="font-bold">Debug Info:</h4>
                    <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                        {`Original Code:\n${webpageCode}\n\nProcessed Code:\n${webpageCode.replace('export default', '')}`}
                    </pre>
                </div>
            </div>
        );
    }

    if (!Component) {
        return (
            <div className="p-4 text-gray-600">
                Loading component...
            </div>
        );
    }

    try {
        return (
            <div className="w-full h-full p-4 border rounded bg-white shadow-sm">
                <Component />
            </div>
        );
    } catch (err) {
        return (
            <div className="p-4 border border-red-500 rounded bg-red-50">
                <h3 className="text-red-600 font-bold">Error rendering component:</h3>
                <pre className="mt-2 text-sm text-red-500 whitespace-pre-wrap">
                    {err.toString()}
                </pre>
            </div>
        );
    }
}

export default WebpageRender;