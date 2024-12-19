import React from 'react';

const ResponseCard = ({ children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex">
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default ResponseCard;
