import React from 'react';

export const FloatingElements = () => {
  return (
    <>
      {/* Floating pills animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-8 bg-blue-200 rounded-full animate-bounce opacity-30" 
             style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-40 right-20 w-6 h-6 bg-green-200 rounded-full animate-bounce opacity-30" 
             style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-40 left-20 w-3 h-6 bg-yellow-200 rounded-full animate-bounce opacity-30" 
             style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-pink-200 rounded-full animate-bounce opacity-30" 
             style={{ animationDelay: '0.5s', animationDuration: '4.5s' }} />
      </div>
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-32 w-8 h-8 border-2 border-teal-200 rotate-45 animate-spin opacity-20" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-32 left-32 w-6 h-6 bg-cyan-200 rounded-full animate-pulse opacity-20" 
             style={{ animationDuration: '6s' }} />
      </div>
    </>
  );
};