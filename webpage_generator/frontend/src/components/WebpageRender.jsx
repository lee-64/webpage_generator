import React, { useEffect, useState } from "react";
import * as Babel from "@babel/standalone";


function WebpageRender({webpageCode}) {
    console.log("Code:", webpageCode)
    const [Component, setComponent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!webpageCode) return;

        const loadComponent = () => {
            try {
                // Transpile the code using Babel
                const transpiledCode = Babel.transform(webpageCode, {
                    presets: ["react", "env"],
                }).code;

                // Initialize a module object to capture exports
                const module = { exports: {} };
                const exports = module.exports;

                // Create a function to evaluate the transpiled code
                const evalFunction = new Function("React", "useState", "exports", transpiledCode);

                // Execute the transpiled code, providing React and exports
                evalFunction(React, React.useState, exports);

                // Retrieve the default export (the component)
                const LoadedComponent = module.exports.default;

                if (!LoadedComponent) {
                    throw new Error("No default export found in the module code.");
                }

                // Set the component to state
                setComponent(() => LoadedComponent);
            } catch (err) {
                console.error("Error loading mini-webpage:", err);
                setError(err);
            }
        };

        loadComponent();
    }, [webpageCode]);

    if (error) {
        return <div style={{ color: "red" }}>Error loading the mini-webpage: {error.message}</div>;
    }

    if (!Component) {
        return <div>Loading mini-webpage...</div>;
    }

    return (
        <div className="w-full h-full p-4 overflow-y-auto">
            <Component/>
        </div>
    );
}

export default WebpageRender;