import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css'; // Optional CSS file

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">😕</div>
          <h1>Oops! Something went wrong</h1>
          <p>We encountered an unexpected error. Please try again or contact support if the problem persists.</p>
          
          <div className="error-actions">
            <button 
              onClick={() => navigate(-1)} 
              className="error-btn primary"
            >
              ← Go Back
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="error-btn secondary"
            >
              🏠 Home
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="error-btn tertiary"
            >
              🔄 Reload Page
            </button>
          </div>

          <div className="error-help">
            <p>If the problem continues, please:</p>
            <ul>
              <li>Check your internet connection</li>
              <li>Clear your browser cache</li>
              <li>Try again in a few minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;