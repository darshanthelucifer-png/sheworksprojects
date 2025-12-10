// src/components/admin/ManageProviders.js
import React, { useState, useEffect } from "react";
import "./ManageProviders.css";
import manualProviders from "../../data/manualProviders"; // ✅ Import your full dataset

const ManageProviders = () => {
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Load providers once
  useEffect(() => {
    setProviders(manualProviders);
  }, []);

  // ✅ Search filtering
  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    const updated = providers.filter((p) => p.id !== id);
    setProviders(updated);
  };

  return (
    <div className="admin-management">
      {/* Header */}
      <div className="provider-header">
        <h1>👩‍🎨 Manage Providers</h1>
        <p>View, search, and manage all providers</p>
      </div>

      {/* Search */}
      <input
        type="text"
        className="search-box"
        placeholder="Search providers by name, category, or service..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Providers Grid */}
      <div className="provider-list">
        {filteredProviders.map((provider) => (
          <div key={provider.id} className="provider-card">
            {/* Image Fix: Strip "public/" if exists */}
            <img
              src={provider.imagePath.replace("public/", "/")}
              alt={provider.name}
              className="provider-image"
              onError={(e) => (e.target.src = "/assets/default-profile.png")}
            />

            <h3>{provider.name}</h3>
            <p className="category">
              {provider.category} • {provider.subCategory}
            </p>
            <p className="rating">
              ⭐ {provider.rating} ({provider.reviews} reviews)
            </p>
            <p className="location">📍 {provider.location}</p>

            <div className="card-actions">
              <button
                className="delete-btn"
                onClick={() => handleDelete(provider.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProviders;
