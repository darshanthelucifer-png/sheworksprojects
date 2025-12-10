import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple admin authentication (replace with secure auth in production)
    if (formData.username === "admin" && formData.password === "admin123") {
      localStorage.setItem("adminToken", "admin-token-" + Date.now());
      localStorage.setItem("adminUser", JSON.stringify({
        username: "admin",
        role: "admin",
        loginTime: new Date().toISOString()
      }));
      
      // Add a small delay for better UX
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 500);
    } else {
      setError("Invalid admin credentials. Please use: admin / admin123");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>🔐 Admin Login</h2>
          <p className="login-subtitle">Access the SheWorks Admin Panel</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter admin username"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter admin password"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={`login-btn ${loading ? 'loading' : ''}`} 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Logging in...
              </>
            ) : (
              "🚀 Login as Admin"
            )}
          </button>
        </form>

        <div className="demo-credentials">
          <div className="demo-header">
            <span>🔑 Demo Credentials</span>
          </div>
          <div className="demo-content">
            <div className="demo-item">
              <p><strong>Username:</strong> admin</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </div>

        <div className="admin-features">
          <h4>🏢 Admin Panel Features</h4>
          <ul>
            <li>📊 Dashboard Analytics</li>
            <li>👥 User Management</li>
            <li>🏪 Provider Management</li>
            <li>📦 Order Management</li>
            <li>💰 Revenue Tracking</li>
          </ul>
        </div>

        <div className="back-to-site">
          <button onClick={() => navigate("/")} disabled={loading}>
            ← Back to Main Site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;