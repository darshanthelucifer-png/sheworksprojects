import React from 'react';
import './TestComponent.css';

const TestComponent = () => {
  return (
    <div className="test-container">
      <h1>🎉 SheWorks is Working!</h1>
      <p>If you can see this, the components are rendering correctly.</p>
      <div className="test-card">
        <h2>Debug Information</h2>
        <p><strong>Current Path:</strong> {window.location.pathname}</p>
        <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
        <p><strong>Role:</strong> {localStorage.getItem('role') || 'Not set'}</p>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="test-btn"
        >
          Clear & Go to Login
        </button>
      </div>
    </div>
  );
};

export default TestComponent;