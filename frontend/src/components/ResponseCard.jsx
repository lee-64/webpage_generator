import React from 'react';

const ResponseCard = ({ children, isExpanded, onToggleExpand }) => {
  return (
    <>
      {/* Background overlay when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 modal-overlay"
          onClick={() => onToggleExpand(false)}
        />
      )}

      <div className={`
        bg-gray-100 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300
        ${isExpanded ? 'fixed top-4 left-4 right-4 bottom-4 z-50' : 'relative'}
      `}>
        {/* Browser-like top bar */}
        <div className="bg-gray-200 px-4 py-2 flex items-center space-x-2 border-b border-gray-300">
          {/* Window controls */}
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
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
        <div className={`
          bg-white w-full overflow-auto
          ${isExpanded ? 'h-[calc(100%-5rem)]' : 'min-h-[400px] max-h-[600px]'}
        `}>
          <div className="w-full h-full p-4">
            {children}
          </div>
        </div>

        {/* Optional bottom status bar */}
        <div className="bg-gray-50 px-4 py-1.5 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Rendered Component</span>
            {isExpanded && (
              <span className="text-xs text-gray-500">
                Press ESC or click outside to close
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResponseCard;