import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./ClientProfileEditPage.css";

const ClientProfileEditPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    location: "",
    bio: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Load initial user
  useEffect(() => {
    const savedUser =
      JSON.parse(localStorage.getItem("currentUser")) ||
      JSON.parse(localStorage.getItem("user")) ||
      {};

    setFormData({
      name: savedUser.name || "",
      email: savedUser.email || "",
      phone: savedUser.phone || savedUser.contact || "",
      address: savedUser.address || "",
      location: savedUser.location || "",
      bio: savedUser.bio || ""
    });
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (formData.bio.length > 500)
      newErrors.bio = "Bio must be less than 500 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generic input handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      let updatedUserData = null;

      // Send to API
      try {
        const response = await axios.put(
          "http://localhost:5000/api/client/profile",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (response.data.success) {
          updatedUserData = response.data.user;
        }
      } catch (apiErr) {
        console.log("API unreachable, falling back to local update.");
        updatedUserData = formData;
      }

      updateLocalStorage(updatedUserData);
      setSuccess(true);

      setTimeout(() => navigate("/client/profile"), 1000);
    } catch (error) {
      setErrors({ submit: "Failed to update profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Sync localStorage
  const updateLocalStorage = (userData) => {
    const existingUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const updatedUser = {
      ...existingUser,
      ...userData,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleCancel = () => {
    navigate("/client/profile");
  };

  return (
    <motion.div
      className="edit-profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="edit-profile-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="profile-edit-header">
          <div className="header-content">
            <h1 className="page-title">Edit Profile</h1>
            <p className="page-subtitle">Update your personal information</p>
          </div>
          <div className="user-identifier">
            <span className="user-icon">👤</span>
            <span className="user-email">{formData.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                className="success-message"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                Profile updated successfully
              </motion.div>
            )}
          </AnimatePresence>

          {/* Personal Information Section */}
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="form-grid">
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? "error" : ""}`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>

              {/* Email (read-only) */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="read-only-field">
                  {formData.email}
                </div>
                <p className="field-hint">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? "error" : ""}`}
                  placeholder="Enter 10-digit phone number"
                />
                {errors.phone && <p className="error-text">{errors.phone}</p>}
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`form-input ${errors.location ? "error" : ""}`}
                  placeholder="City, State"
                />
                {errors.location && <p className="error-text">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="form-section">
            <h3 className="section-title">Contact Details</h3>
            
            <div className="form-group">
              <label className="form-label">Address *</label>
              <textarea
                rows="3"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`form-textarea ${errors.address ? "error" : ""}`}
                placeholder="Enter your complete address"
              />
              {errors.address && <p className="error-text">{errors.address}</p>}
            </div>
          </div>

          {/* Bio Section */}
          <div className="form-section">
            <h3 className="section-title">About Yourself</h3>
            
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                rows="4"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={`form-textarea ${errors.bio ? "error" : ""}`}
                placeholder="Tell us about yourself (optional)"
              />
              <div className="character-counter">
                {formData.bio.length}/500 characters
              </div>
              {errors.bio && <p className="error-text">{errors.bio}</p>}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="save-btn primary-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>

            <button
              type="button"
              className="cancel-btn secondary-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>

          {/* Required fields note */}
          <div className="form-footer">
            <p className="required-note">* Required fields</p>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ClientProfileEditPage;