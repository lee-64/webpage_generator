import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { tomorrowNight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy } from 'lucide-react';

export default function ResponseCard({
  children,
  isExpanded,
  onToggleExpand,
  generatedCode,
  isSelected,
  onSelect
}) {
  const [isRemoved, setIsRemoved] = useState(false);
  const [transition, setTransition] = useState(false);
  const [viewMode, setViewMode] = useState('preview');

  const onToggleRemove = () => {
    setTransition(true);
    console.log("Should be removed.");
  };

  const handleCardClick = (event) => {
    const target = event.target;
    if (
      !target.closest('button') &&
      !target.classList.contains('modal-overlay') &&
      onSelect
    ) {
      onSelect();
    }
  };

  return (
    <>
      {isExpanded && !isRemoved && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 modal-overlay"
          onClick={() => onToggleExpand(false)}
        />
      )}

      {!isRemoved && (
        <motion.div
          onClick={handleCardClick}
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
            bg-gray-100 rounded-xl shadow-xl overflow-hidden hover:shadow-xl transition-all duration-300
            ${isExpanded ? 'fixed md:top-10 md:left-20 md:right-20 md:bottom-10 top-0 left-0 right-0 bottom-0 z-50' : 'relative'}
            ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 ring-opacity-80' : ''}
          `}
        >
          {/* Header */}
          <div className="bg-gray-200 px-2 md:px-4 py-2 flex items-center space-x-2 border-b border-gray-300">
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

            <div className="flex-1 ml-2 md:ml-4">
              <div className="bg-white rounded-md py-1 px-2 md:px-3 text-xs text-gray-500 flex items-center">
                <span className="mr-1 md:mr-2">🔒</span>
                <span className="truncate text-xs md:text-sm">myapp.com/home</span>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
                const popup = document.createElement('div');
                popup.innerText = 'Code copied';
                popup.className = 'fixed bottom-4 right-4 bg-gray-800/80 text-white px-4 py-2 rounded-lg shadow-lg transition-transform duration-200 transform translate-y-10 opacity-0';
                requestAnimationFrame(() => {
                  popup.classList.add('translate-y-0', 'opacity-100');
                });
                document.body.appendChild(popup);
                setTimeout(() => {
                  popup.classList.remove('translate-y-0', 'opacity-100');
                  popup.classList.add('translate-y-10', 'opacity-0');
                  setTimeout(() => {
                    document.body.removeChild(popup);
                  }, 500);
                }, 3000);
              }}
              className="ml-2 p-1 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none"
              title="Copy code to clipboard"
              aria-label="Copy code to clipboard"
            >
              <Copy width={15} height={15} />
            </button>
          </div>

          {/* Content */}
          <div
            className={`
              bg-white w-full overflow-auto
              ${isExpanded 
                ? 'h-[calc(100%-5rem)]' 
                : 'min-h-[250px] md:min-h-[400px] max-h-[400px] md:max-h-[600px]'}
            `}
          >
            <div className="w-full h-full p-2 md:p-4">
              {viewMode === 'preview' ? (
                children
              ) : (
                <pre className="max-w-auto rounded-lg overflow-x-auto">
                  <SyntaxHighlighter 
                    language="javascript" 
                    style={tomorrowNight} 
                    customStyle={{ 
                      fontSize: window.innerWidth < 768 ? '8px' : '10px',
                      padding: window.innerWidth < 768 ? '0.5rem' : '1rem'
                    }}
                  >
                    {generatedCode}
                  </SyntaxHighlighter>
                </pre>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-2 md:px-4 py-1.5 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 hidden md:inline">Rendered Component</span>
              <div className="flex items-center space-x-2 w-full md:w-auto">
                {isExpanded && (
                  <span className="text-xs text-gray-500 hidden md:inline mr-4">
                    Press ESC or click outside to close
                  </span>
                )}
                <div className="flex rounded-md shadow-sm flex-1 md:flex-none justify-center md:justify-start" role="group">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-l-md flex-1 md:flex-none
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
                      px-3 py-1 text-xs font-medium rounded-r-md flex-1 md:flex-none
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
}