import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getProviderById } from "../../data";
import "./ProviderProfileView.css";

const ProviderProfileView = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Normalize Provider Image Handling
  const getProviderImage = (p) => {
    const img = p.profileImage || p.photo || p.image || p.imagePath;
    if (!img) return "/assets/providers/default-provider.jpg";

    if (img.startsWith("public/")) return "/" + img.replace("public/", "");
    if (img.startsWith("/")) return img;
    return "/" + img;
  };

  useEffect(() => {
    const providerSession = localStorage.getItem("providerSession");

    // ✅ Redirect to MAIN LOGIN if no session
    if (!providerSession) {
      navigate("/login");
      return;
    }

    const sessionData = JSON.parse(providerSession);
    const providerDetails = getProviderById(sessionData.id);

    if (providerDetails) {
      setProvider(providerDetails);
    }
    setLoading(false);
  }, [navigate]);

  // ✅ Logout redirects to Main Login
  const handleLogout = () => {
    localStorage.removeItem("providerSession");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );

  if (!provider) {
    return (
      <div className="no-profile">
        <h2>Profile Not Found</h2>
        <p>Your provider profile could not be located.</p>
        <button className="primary-btn" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  const providerImage = getProviderImage(provider);

  return (
    <div className="provider-profile-view">
      {/* HEADER */}
      <div className="profile-header">
        <motion.img
          src={providerImage}
          alt={provider.name}
          className="profile-pic"
          whileHover={{ scale: 1.05 }}
        />

        <div className="profile-header-info">
          <h2>{provider.name}</h2>
          <p className="provider-tag">
            {provider.category} · {provider.subCategory}
          </p>

          {/* ❌ Rating & Reviews REMOVED */}

          <div className="profile-buttons">
            <button
              className="btn primary"
              onClick={() => navigate("/provider/dashboard")}
            >
              📊 Dashboard
            </button>
            <button
              className="btn"
              onClick={() => navigate("/provider/manage-bookings")}
            >
              📅 Manage Bookings
            </button>
            <button
              className="btn"
              onClick={() => navigate("/provider/edit-profile")}
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <motion.div
        className="section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3>About</h3>
        <p>{provider.description || "No description added yet."}</p>
      </motion.div>

      {/* DETAILS */}
      <div className="details-grid">
        <div><strong>📍 Location:</strong> {provider.location}</div>
        <div><strong>⏱ Experience:</strong> {provider.experience}</div>
        <div><strong>💰 Price Range:</strong> {provider.priceRange}</div>
        <div><strong>📞 Phone:</strong> {provider.phone}</div>
        <div><strong>📧 Email:</strong> {provider.email}</div>
      </div>

      {/* SERVICES */}
      <div className="section">
        <h3>Services Offered</h3>
        <div className="services-list">
          {provider.services?.length > 0 ? (
            provider.services.map((service, index) => (
              <span key={index} className="service-chip">
                {service}
              </span>
            ))
          ) : (
            <p>No services listed.</p>
          )}
        </div>
      </div>

      {/* BUSINESS STATS */}
      <div className="stats-grid">
        <div className="stat-box">
          <span>{provider.reviews}</span>Completed Orders
        </div>
        <div className="stat-box">
          <span>{provider.rating}/5</span>Rating
        </div>
        <div className="stat-box">
          <span>98%</span>Response Rate
        </div>
        <div className="stat-box">
          <span>24h</span>Avg Response Time
        </div>
      </div>

      {/* LOGOUT */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default ProviderProfileView;
