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
    profileImage: "",
    phone: "",
    address: "",
    location: "",
    bio: ""
  });

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Load initial user
  useEffect(() => {
    const savedUser =
      JSON.parse(localStorage.getItem("currentUser")) ||
      JSON.parse(localStorage.getItem("user")) ||
      {};

    const image =
      savedUser.profileImage ||
      savedUser.profilePic ||
      "/assets/default-profile.png";

    setFormData({
      name: savedUser.name || "",
      email: savedUser.email || "",
      profileImage: image,
      phone: savedUser.phone || savedUser.contact || "",
      address: savedUser.address || "",
      location: savedUser.location || "",
      bio: savedUser.bio || ""
    });

    setPreviewUrl(image);
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

  // Profile Image Handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: "Image must be less than 5MB" });
      return;
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setErrors((prev) => ({ ...prev, image: "" }));
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
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "profileImage") submitData.append(key, formData[key]);
      });

      if (imageFile) {
        submitData.append("profileImage", imageFile);
      }

      // Send to API
      let updatedUserData = null;
      try {
        const response = await axios.put(
          "http://localhost:5000/api/client/profile",
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        if (response.data.success) {
          updatedUserData = response.data.user; // FULL IMAGE URL INCLUDED
        }
      } catch (apiErr) {
        console.log("API unreachable, falling back to local update.");
        updatedUserData = {
          ...formData,
          profileImage: previewUrl
        };
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
    const updatedUser = {
      ...userData,
      profileImage: userData.profileImage || previewUrl,
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
          <h2>Edit Profile</h2>
          <p>Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Image Upload */}
          <div className="profile-pic-section">
            <div className="image-preview-wrapper">
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="profile-preview"
              />

              <label className="camera-button">
                <input
                  type="file"
                  className="file-input"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                Change Photo
              </label>
            </div>

            {errors.image && <p className="error-text">{errors.image}</p>}
          </div>

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

          {/* Form Fields */}
          <div className="form-grid">
            {/* Name */}
            <Field
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            {/* Email (disabled) */}
            <Field
              label="Email Address"
              name="email"
              value={formData.email}
              disabled
            />

            {/* Phone */}
            <Field
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            {/* Location */}
            <Field
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              error={errors.location}
            />
          </div>

          {/* Address */}
          <TextAreaField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
          />

          {/* Bio */}
          <TextAreaField
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            error={errors.bio}
          />

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          {/* Buttons */}
          <div className="form-actions">
            <button className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ---------------- Reusable Field Components ---------------- */

const Field = ({ label, name, value, onChange, disabled, error }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      className={`form-input ${error ? "error" : ""}`}
    />
    {error && <p className="error-text">{error}</p>}
  </div>
);

const TextAreaField = ({ label, name, value, onChange, error }) => (
  <div className="form-group full-width">
    <label className="form-label">{label}</label>
    <textarea
      rows="3"
      name={name}
      value={value}
      onChange={onChange}
      className={`form-textarea ${error ? "error" : ""}`}
    />
    {error && <p className="error-text">{error}</p>}
  </div>
);

export default ClientProfileEditPage;
