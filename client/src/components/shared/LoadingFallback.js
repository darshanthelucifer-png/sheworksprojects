import React from 'react';
import './LoadingFallback.css';

const LoadingFallback = () => {
  return (
    <div className="loading-fallback">
      <div className="spinner"></div>
      <h2>Loading SheWorks...</h2>
      <p>Please wait while we set up your experience</p>
    </div>
  );
};

export default LoadingFallback;