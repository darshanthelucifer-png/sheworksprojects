import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./CreateClientProfile.css";

const CreateClientProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    location: "",
    address: "",
    bio: ""
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const API_BASE = "http://localhost:5000/api";

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const user = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || '{}');
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          name: user.name || "",
          email: user.email || ""
        }));
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact number is required";
    if (!/^\d{10}$/.test(formData.contact)) newErrors.contact = "Enter a valid 10-digit phone number";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle image upload
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "Please select an image file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size should be less than 5MB" }));
        return;
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setErrors(prev => ({ ...prev, image: "" }));
    }
  }, []);

  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // Submit profile data
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      const updatedUser = {
        ...currentUser,
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        location: formData.location,
        address: formData.address,
        bio: formData.bio,
        profileImage: imagePreview || "/assets/default-profile.png",
        profilePic: imagePreview || "/assets/default-profile.png",
        profileCompleted: true,
        role: "client",
        createdAt: currentUser.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🔄 Creating client profile:', updatedUser);

      // Try API call first
      try {
        const submitData = new FormData();
        Object.keys(updatedUser).forEach(key => {
          if (key !== 'profileImage' && key !== 'profilePic') {
            submitData.append(key, updatedUser[key]);
          }
        });
        
        if (imageFile) {
          submitData.append('profileImage', imageFile);
        }

        const response = await axios.post(
          `${API_BASE}/client/create-profile`,
          submitData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          updatedUser.id = response.data.user.id || updatedUser.id;
          updatedUser._id = response.data.user._id;
        }
      } catch (apiError) {
        console.log("API unavailable, using localStorage");
      }

      // Update localStorage as fallback
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? updatedUser : user
      );

      if (!users.find(user => user.id === currentUser.id)) {
        updatedUsers.push(updatedUser);
      }

      localStorage.setItem("users", JSON.stringify(updatedUsers));
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("role", "client");
      
      console.log('✅ Client profile created successfully!');
      setSuccessMessage("Profile created successfully! Redirecting...");

      setTimeout(() => {
        navigate("/client/dashboard");
      }, 1500);
      
    } catch (error) {
      console.error("Profile creation failed:", error);
      setErrors(prev => ({ ...prev, submit: "Error creating profile. Please try again!" }));
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="profile-loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-setup-container">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="setup-header"
        >
          <div className="header-content">
            <div className="header-text">
              <h1>👋 Welcome to SheWorks!</h1>
              <p>Complete your profile to get started with amazing services</p>
            </div>
            <motion.button
              onClick={() => navigate("/login")}
              className="back-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back to Login
            </motion.button>
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="client-setup-card"
        >
          <h2>Create Your Client Profile</h2>
          <p className="setup-subtitle">
            Tell us about yourself to personalize your experience
          </p>

          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="success-message"
              >
                ✅ {successMessage}
              </motion.div>
            )}
            
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="error-message"
              >
                ❌ {errors.submit}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="profile-form">
            {/* Profile Image Section */}
            <ProfileImageUpload 
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              error={errors.image}
            />

            <div className="form-sections">
              {/* Personal Information Section */}
              <FormSection title="👤 Personal Information" icon="👤">
                <div className="form-grid">
                  <FormField
                    label="Full Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Enter your full name"
                    required
                  />

                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="Enter your email"
                    required
                    readOnly
                  />
                </div>
              </FormSection>

              {/* Contact Information Section */}
              <FormSection title="📞 Contact Information" icon="📞">
                <div className="form-grid">
                  <FormField
                    label="Contact Number"
                    name="contact"
                    type="tel"
                    value={formData.contact}
                    onChange={handleChange}
                    error={errors.contact}
                    placeholder="10-digit phone number"
                    pattern="[0-9]{10}"
                    required
                  />

                  <FormField
                    label="Location/City"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    error={errors.location}
                    placeholder="Enter your city"
                    required
                  />
                </div>
              </FormSection>

              {/* Address Section */}
              <FormSection title="📍 Address Details" icon="📍">
                <TextAreaField
                  label="Complete Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="Enter your complete address with landmarks..."
                  rows={3}
                  required
                />
              </FormSection>

              {/* Bio Section */}
              <FormSection title="💬 About Yourself" icon="💬" optional>
                <TextAreaField
                  label="Bio (Optional)"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your interests and what services you're looking for..."
                  rows={3}
                  maxLength={200}
                  showCharCount={true}
                  currentLength={formData.bio.length}
                />
              </FormSection>
            </div>

            {/* Submit Section */}
            <SubmitSection 
              loading={loading}
              onSubmit={handleSubmit}
              formData={formData}
            />
          </form>
        </motion.div>
      </div>
    </div>
  );
};

// Sub-components
const ProfileImageUpload = ({ imagePreview, onImageChange, error }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="profile-image-section"
  >
    <div className="image-preview-container">
      <div className="image-preview" onClick={() => document.getElementById('profile-image-input').click()}>
        {imagePreview ? (
          <img src={imagePreview} alt="Profile Preview" />
        ) : (
          <div className="default-avatar">
            👤
          </div>
        )}
        <div className="camera-icon">
          📷
        </div>
      </div>
      
      <input
        id="profile-image-input"
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="file-input"
      />
      
      <div className="file-input-wrapper">
        <label htmlFor="profile-image-input" className="file-input">
          📁 Choose Profile Image
        </label>
      </div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="error-text"
        >
          ⚠️ {error}
        </motion.p>
      )}
      <p className="image-help-text">Click on the image or button to upload your profile photo</p>
    </div>
  </motion.div>
);

const FormSection = ({ title, icon, children, optional = false }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="form-section"
  >
    <div className="section-header">
      <span className="section-icon">{icon}</span>
      <h3>{title}</h3>
      {optional && <span className="optional-badge">Optional</span>}
    </div>
    {children}
  </motion.div>
);

const FormField = ({ 
  label, 
  name, 
  type, 
  value, 
  onChange, 
  error, 
  placeholder, 
  required = false,
  readOnly = false,
  pattern,
  ...props 
}) => (
  <div className={`form-group ${error ? 'error' : ''}`}>
    <label htmlFor={name}>
      {label}
      {required && <span className="required-star">*</span>}
    </label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      readOnly={readOnly}
      pattern={pattern}
      placeholder={placeholder}
      className={readOnly ? 'readonly-input' : ''}
      {...props}
    />
    {error && (
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="validation-message error"
      >
        ⚠️ {error}
      </motion.p>
    )}
  </div>
);

const TextAreaField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  placeholder, 
  rows = 3, 
  required = false,
  showCharCount = false,
  currentLength = 0,
  maxLength,
  ...props 
}) => (
  <div className={`form-group ${error ? 'error' : ''}`}>
    <label htmlFor={name}>
      {label}
      {required && <span className="required-star">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      rows={rows}
      maxLength={maxLength}
      placeholder={placeholder}
      {...props}
    />
    {error && (
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="validation-message error"
      >
        ⚠️ {error}
      </motion.p>
    )}
    {showCharCount && (
      <div className="character-count">
        {currentLength}/{maxLength} characters
        {currentLength > maxLength * 0.8 && (
          <span className="warning"> - Getting close to limit!</span>
        )}
      </div>
    )}
  </div>
);

const SubmitSection = ({ loading, onSubmit, formData }) => {
  const isFormValid = formData.name && formData.email && formData.contact && 
                     formData.location && formData.address;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="submit-section"
    >
      <motion.button
        type="submit"
        onClick={onSubmit}
        disabled={!isFormValid || loading}
        className={`submit-btn ${!isFormValid ? 'btn-disabled' : ''}`}
        whileHover={isFormValid && !loading ? { scale: 1.02, y: -2 } : {}}
        whileTap={isFormValid && !loading ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <div className="btn-spinner"></div>
            Creating Your Profile...
          </>
        ) : (
          <>
            🚀 Complete Profile & Get Started
          </>
        )}
      </motion.button>
      
      {!isFormValid && (
        <p className="form-help-text">
          Please fill in all required fields to continue
        </p>
      )}
      
      <p className="terms-text">
        By creating your profile, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
      </p>
    </motion.div>
  );
};

export default CreateClientProfile;