import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="container">
        <h1>😕 Something went wrong</h1>
        <p>We encountered an unexpected error. Please try again.</p>
        <div className="error-actions">
          <button onClick={() => navigate(-1)}>Go Back</button>
          <button onClick={() => navigate('/')}>Home</button>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;