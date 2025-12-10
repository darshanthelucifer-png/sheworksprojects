import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateProfile.css";

const CreateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    location: "",
    bio: "",
    services: [],
    profileImage: null,
    profileImageUrl: "",
    paymentDetails: {
      upiId: "",
      accountNumber: "",
      accountName: "",
      bankName: ""
    }
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Service categories matching your project requirements
  const serviceCategories = {
    "Embroidery": ["Hand Embroidery", "Pearl Embroidery", "Beads Embroidery", "Machine Embroidery"],
    "Home Food": ["South Indian", "North Indian", "Snacks"],
    "Customized Gifts": ["Birthday Gifts", "Anniversary Gifts", "Wedding Gifts", "Occasional Gifts"],
    "Arts and Crafts": ["Paintings", "Paper Crafting", "Clay Modelling", "Collage Making"],
    "Fashion and Tailoring": ["Women's Wear", "Men's Wear", "Kids Wear", "Ethnic Wear", "Party Wear"],
    "Beauty and Wellness": ["Bridal Makeup", "Skincare", "Haircare", "Manicure and Pedicure", "Full Body Massage"],
    "Event Decoration": ["Birthday Parties", "Anniversary Decoration", "Wedding Decoration", "Festival Decoration"],
    "Sugar Bloom": ["Cake Artistry", "Cupcake and Muffin Creations", "Cookies and Biscuits Making"],
    "Home Gardening Kits": ["Indoor Plants", "Plant Kit", "Herb Kits", "Vegetable Kit"],
    "Traditional Festive Kit": ["Puja Kits", "Festival Essential Kit", "Diwali Festival Kit"]
  };

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || '{}');
    setCurrentUser(user);
    console.log("Loading existing provider data:", user);
    
    // Pre-fill form with existing data if available
    setFormData(prev => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      contact: user.contact || "",
      location: user.location || "",
      bio: user.bio || "",
      services: user.services || [],
      paymentDetails: user.paymentDetails || {
        upiId: "",
        accountNumber: "",
        accountName: "",
        bankName: ""
      }
    }));
    
    // Set selected services
    if (user.services && user.services.length > 0) {
      setSelectedServices(user.services);
    }
    
    // Set image preview if exists
    if (user.profileImage || user.profilePic) {
      setImagePreview(user.profileImage || user.profilePic);
    }
  }, []);

  const [selectedServices, setSelectedServices] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, WebP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target.result;
        setImagePreview(imageDataUrl);
        setFormData({
          ...formData,
          profileImage: file,
          profileImageUrl: imageDataUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("payment.")) {
      const paymentField = name.split(".")[1];
      setFormData({
        ...formData,
        paymentDetails: {
          ...formData.paymentDetails,
          [paymentField]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleServiceToggle = (category, subservice) => {
    const serviceKey = `${category} - ${subservice}`;
    setSelectedServices(prev => {
      const newServices = prev.includes(serviceKey) 
        ? prev.filter(s => s !== serviceKey)
        : [...prev, serviceKey];
      
      // Update form data
      setFormData(prevData => ({
        ...prevData,
        services: newServices
      }));
      
      return newServices;
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert("Please enter your business name");
      return false;
    }
    if (!formData.contact.trim() || !/^\d{10}$/.test(formData.contact)) {
      alert("Please enter a valid 10-digit contact number");
      return false;
    }
    if (!formData.location.trim()) {
      alert("Please enter your location");
      return false;
    }
    if (!formData.bio.trim()) {
      alert("Please enter your business bio");
      return false;
    }
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      console.log("🔄 Saving provider profile...");
      
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Create comprehensive provider data
      const providerData = {
        ...currentUser,
        name: formData.name,
        contact: formData.contact,
        location: formData.location,
        bio: formData.bio,
        services: selectedServices,
        profileImage: imagePreview,
        profilePic: imagePreview || "/assets/default-profile.png",
        paymentDetails: formData.paymentDetails,
        profileCompleted: true, // THIS IS THE KEY LINE THAT FIXES THE REDIRECT LOOP
        role: "provider",
        registrationDate: new Date().toISOString(),
        businessStats: {
          totalEarnings: 0,
          completedOrders: 0,
          averageRating: 4.5, // Default starting rating
          totalReviews: 0
        },
        isActive: true,
        updatedAt: new Date().toISOString()
      };

      console.log('✅ Updated provider data:', providerData);

      // Update the users array
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? providerData : user
      );

      // Save everything back to localStorage
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      localStorage.setItem("currentUser", JSON.stringify(providerData));
      localStorage.setItem("user", JSON.stringify(providerData)); // For compatibility
      localStorage.setItem("role", "provider");
      
      // Also save to a separate providers list for clients to see
      const allProviders = JSON.parse(localStorage.getItem("allProviders") || "[]");
      const existingIndex = allProviders.findIndex(p => p.email === providerData.email);
      
      if (existingIndex >= 0) {
        allProviders[existingIndex] = providerData;
      } else {
        // Add unique ID if not exists
        if (!providerData.id) {
          providerData.id = 'provider_' + Date.now().toString();
        }
        allProviders.push(providerData);
      }
      
      localStorage.setItem("allProviders", JSON.stringify(allProviders));

      // Also update manualProviders for dashboard compatibility
      const manualProviders = JSON.parse(localStorage.getItem("manualProviders") || "[]");
      const manualProviderIndex = manualProviders.findIndex(p => p.email === providerData.email);
      
      if (manualProviderIndex >= 0) {
        // Update existing manual provider
        manualProviders[manualProviderIndex] = {
          ...manualProviders[manualProviderIndex],
          ...providerData
        };
      } else {
        // Add as new manual provider for full compatibility
        const newManualProvider = {
          id: providerData.id,
          name: providerData.name,
          email: providerData.email,
          password: providerData.password,
          serviceId: providerData.serviceId || generateServiceId(providerData.name),
          phone: providerData.contact,
          location: providerData.location,
          type: "registered_provider"
        };
        manualProviders.push(newManualProvider);
      }
      
      localStorage.setItem("manualProviders", JSON.stringify(manualProviders));
      
      console.log('✅ Profile completed successfully!');
      console.log('📊 Users array updated:', updatedUsers);

      // Set provider session for dashboard
      const providerSession = {
        id: providerData.id,
        name: providerData.name,
        email: providerData.email,
        serviceId: providerData.serviceId,
        phone: providerData.contact,
        location: providerData.location,
        type: "registered_provider",
        loginTime: new Date().toISOString()
      };
      localStorage.setItem("providerSession", JSON.stringify(providerSession));

      // Wait a moment for localStorage to update
      setTimeout(() => {
        navigate("/provider/dashboard");
      }, 100);
      
    } catch (error) {
      console.error("❌ Provider profile creation failed:", error);
      alert("❌ Error saving profile. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate service ID
  const generateServiceId = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 20);
  };

  return (
    <div className="provider-setup-container">
      <div className="provider-setup-card">
        <h2>
          {currentUser?.profileCompleted 
            ? "Edit Your Profile" 
            : "Complete Your Provider Profile"
          }
        </h2>
        <p className="setup-subtitle">
          {currentUser?.profileCompleted 
            ? "Update your business information" 
            : "Complete your profile to start using the provider dashboard"
          }
        </p>
        
        {/* Profile Image Upload */}
        <div className="profile-image-section">
          <div className="image-preview">
            <img 
              src={imagePreview || "/assets/default-profile.png"} 
              alt="Profile Preview" 
              onError={(e) => {
                e.target.src = "/assets/default-profile.png";
              }}
            />
          </div>
          <div className="image-upload-controls">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              id="profileImage"
            />
            <label htmlFor="profileImage" className="file-input-label">
              📷 {imagePreview ? "Change Profile Image" : "Upload Profile Image"}
            </label>
            <small className="image-help-text">
              Recommended: Square image, JPG/PNG/WebP, max 5MB
            </small>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Business Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your business name"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                readOnly
                className="readonly-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Number *</label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  placeholder="10-digit number"
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit number"
                />
              </div>

              <div className="form-group">
                <label>Business Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Your city or area"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Business Bio *</label>
              <textarea
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                required
                placeholder="Describe your services, experience, and what makes your business special..."
              ></textarea>
              <small className="help-text">
                This description will be visible to clients looking for your services
              </small>
            </div>
          </div>

          {/* Services Selection */}
          <div className="form-section">
            <h3>Select Your Services *</h3>
            <p className="section-subtitle">Choose the services you offer to clients</p>
            
            <div className="services-selection">
              {Object.entries(serviceCategories).map(([category, subservices]) => (
                <div key={category} className="service-category">
                  <h4>{category}</h4>
                  <div className="subservices-list">
                    {subservices.map(subservice => (
                      <label 
                        key={subservice} 
                        className={`service-checkbox ${selectedServices.includes(`${category} - ${subservice}`) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(`${category} - ${subservice}`)}
                          onChange={() => handleServiceToggle(category, subservice)}
                          hidden
                        />
                        <span className="checkmark">✓</span>
                        {subservice}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedServices.length > 0 && (
              <div className="selected-services-summary">
                <strong>Selected Services ({selectedServices.length}):</strong>
                <div className="selected-services-list">
                  {selectedServices.map(service => (
                    <span key={service} className="selected-service-tag">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="form-section">
            <h3>Payment Information</h3>
            <p className="section-subtitle">Set up your payment details to receive payments</p>
            
            <div className="form-group">
              <label>UPI ID</label>
              <input
                type="text"
                name="payment.upiId"
                value={formData.paymentDetails.upiId}
                onChange={handleChange}
                placeholder="yourname@upi"
              />
              <small className="help-text">
                Recommended for quick payments from clients
              </small>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="payment.bankName"
                  value={formData.paymentDetails.bankName}
                  onChange={handleChange}
                  placeholder="Bank name"
                />
              </div>
              
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="payment.accountNumber"
                  value={formData.paymentDetails.accountNumber}
                  onChange={handleChange}
                  placeholder="Bank account number"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                name="payment.accountName"
                value={formData.paymentDetails.accountName}
                onChange={handleChange}
                placeholder="Name as in bank account"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading} 
              className={`submit-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? "🔄 Saving Profile..." : "💾 Complete Profile & Go to Dashboard"}
            </button>

            <div className="info-text">
              {currentUser?.profileCompleted 
                ? "Your profile will be updated immediately"
                : "Once completed, you'll have full access to the provider dashboard"
              }
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;