// src/components/provider/ProviderLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProviderLogin.css";

export default function ProviderLogin() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Load providers from localStorage (seeded by initProviders)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("manualProviders") || "[]");
    setProviders(stored);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const provider = providers.find(
      (p) => p.email === form.email && p.password === form.password && p.isActive
    );

    if (!provider) {
      setError("Invalid email or password");
      return;
    }

    // ✅ SET TOKEN + ROLE like clients
    const token = `provider-${Date.now()}`;
    localStorage.setItem("token", token);
    localStorage.setItem("role", "provider");

    // ✅ Store provider session object
    localStorage.setItem(
      "providerSession",
      JSON.stringify({
        id: provider.id,
        name: provider.name,
        email: provider.email,
        serviceId: provider.serviceId,
      })
    );

    console.log("✅ Provider logged in:", provider.name);

    navigate("/provider/dashboard", { replace: true });
  };

  return (
    <div className="provider-login-wrapper">
      <div className="provider-login-card">
        <h2>Provider Login</h2>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="register-text">
          New Provider?{" "}
          <span
            className="register-link"
            onClick={() => navigate("/provider/create-profile")}
          >
            Register here
          </span>
        </p>

        <hr />

        <h4>Demo Provider Accounts</h4>
        <div className="demo-box">
          {providers.slice(0, 4).map((p, i) => (
            <div key={i} className="demo-item">
              <strong>{p.name}</strong>
              <div>{p.email}</div>
              <code>Password: {p.password}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
