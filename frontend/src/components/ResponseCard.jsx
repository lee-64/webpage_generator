import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ResponseCard = ({ children, isExpanded, onToggleExpand, generatedCode }) => {
  const [isRemoved, setIsRemoved] = useState(false);
  const [transition, setTransition] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // New state for toggle

  const onToggleRemove = () => {
    setTransition(true);
    console.log("Should be removed.");
  };


  return (
    <>
      {/* Background overlay when expanded */}
      {isExpanded && !isRemoved && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 modal-overlay"
          onClick={() => onToggleExpand(false)}
        />
      )}

      {!isRemoved && (
        <motion.div
          animate={
            transition
              ? { opacity: 0, y: -50, scale: 0.4, rotate: -30 }
              : { opacity: 1, y: 0, scale: 1, rotate: 0 }
          }
          transition={{
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
          }}
          onAnimationComplete={() => {
            if (transition) setIsRemoved(true);
          }}
          className={`
            bg-gray-100 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300
            ${isExpanded ? 'fixed top-4 left-4 right-4 bottom-4 z-50' : 'relative'}
          `}
        >
          {/* Browser-like top bar */}
          <div className="bg-gray-200 px-4 py-2 flex items-center space-x-2 border-b border-gray-300">
            {/* Window controls */}
            <div className="flex space-x-1.5">
              <button
                onClick={onToggleRemove}
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              />
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <button
                onClick={() => onToggleExpand(!isExpanded)}
                className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                title={isExpanded ? "Collapse" : "Expand"}
                aria-label={isExpanded ? "Collapse window" : "Expand window"}
              />
            </div>

            {/* URL bar */}
            <div className="flex-1 ml-4">
              <div className="bg-white rounded-md py-1 px-3 text-xs text-gray-500 flex items-center">
                <span className="mr-2">🔒</span>
                <span className="truncate">localhost:3000/app</span>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div
            className={`
              bg-white w-full overflow-auto
              ${isExpanded ? 'h-[calc(100%-5rem)]' : 'min-h-[400px] max-h-[600px]'}
            `}
          >
            <div className="w-full h-full p-4">
              {viewMode === 'preview' ? (
                children
              ) : (
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                  <code className="text-sm text-gray-800">{generatedCode}</code>
                </pre>
              )}
            </div>
          </div>

          {/* Bottom status bar with toggle */}
          <div className="bg-gray-50 px-4 py-1.5 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Rendered Component</span>
              <div className="flex items-center space-x-2">
                {isExpanded && (
                  <span className="text-xs text-gray-500 mr-4">
                    Press ESC or click outside to close
                  </span>
                )}
                <div className="flex rounded-md shadow-sm" role="group">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-l-md
                      ${viewMode === 'preview' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'}
                      border border-gray-300
                    `}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-r-md
                      ${viewMode === 'code' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'}
                      border border-gray-300 border-l-0
                    `}
                  >
                    Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ResponseCard;