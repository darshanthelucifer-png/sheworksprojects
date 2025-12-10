import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "client",
        agreeToTerms: false,
        // Provider-specific fields
        serviceId: "",
        category: "",
        phone: "",
        location: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [passwordStrength, setPasswordStrength] = useState("");
    const [showProviderFields, setShowProviderFields] = useState(false);
    const navigate = useNavigate();

    // Service categories from your services.json
    const serviceCategories = [
        "Embroidery", "Home Cooked Food", "Custom Gifts", "Arts & Crafts", 
        "Fashion & Tailoring", "Beauty & Wellness", "Sugar Bloom", 
        "Event Decoration", "Home Gardening Kits", "Traditional Festival Kits"
    ];

    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('role');
        localStorage.removeItem('providerSession');
    }, []);

    // Show/hide provider fields based on role selection
    useEffect(() => {
        setShowProviderFields(formData.role === "provider");
    }, [formData.role]);

    const handleChange = (e) => {
        setError("");
        setSuccessMessage("");
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });

        if (name === 'password') {
            checkPasswordStrength(value);
        }

        // Auto-generate serviceId from name for providers
        if (name === 'name' && formData.role === 'provider') {
            const serviceId = value.toLowerCase().replace(/\s+/g, '_');
            setFormData(prev => ({
                ...prev,
                serviceId: serviceId
            }));
        }
    };

    const checkPasswordStrength = (password) => {
        if (password.length === 0) {
            setPasswordStrength("");
            return;
        }
        
        if (password.length < 6) {
            setPasswordStrength("weak");
        } else if (password.length < 8) {
            setPasswordStrength("medium");
        } else {
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar) {
                setPasswordStrength("strong");
            } else {
                setPasswordStrength("medium");
            }
        }
    };

    const validateForm = () => {
        // Basic validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.role) {
            setError("Please fill in all fields");
            return false;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        if (!formData.email.includes('@') || !formData.email.includes('.')) {
            setError("Please enter a valid email address");
            return false;
        }

        if (!formData.agreeToTerms) {
            setError("Please agree to the Terms and Conditions");
            return false;
        }

        // Provider-specific validation
        if (formData.role === "provider") {
            if (!formData.serviceId || !formData.category) {
                setError("Please fill in all provider fields");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            
            const userExists = existingUsers.find(user => 
                user.email.toLowerCase() === formData.email.toLowerCase() && 
                user.role === formData.role
            );
            
            if (userExists) {
                setError("An account with this email and role already exists.");
                return;
            }

            // Create user object
            const newUser = {
                id: "user-" + Date.now(),
                name: formData.name,
                email: formData.email.toLowerCase(),
                password: formData.password,
                role: formData.role,
                profileCompleted: false,
                createdAt: new Date().toISOString()
            };

            // If provider, create provider profile
            if (formData.role === "provider") {
                const newProvider = {
                    id: `PROV_${Date.now()}`,
                    name: formData.name,
                    email: formData.email.toLowerCase(),
                    password: formData.password,
                    serviceId: formData.serviceId,
                    category: formData.category,
                    phone: formData.phone || "Not provided",
                    location: formData.location || "Not specified",
                    rating: 0,
                    reviews: 0,
                    experience: "New provider",
                    description: `${formData.category} service provider`,
                    isActive: true,
                    providerType: "registered", // Differentiate from manual providers
                    profileCompleted: false,
                    createdAt: new Date().toISOString()
                };

                // Save to registered providers
                const existingProviders = JSON.parse(localStorage.getItem("registeredProviders") || "[]");
                const updatedProviders = [...existingProviders, newProvider];
                localStorage.setItem("registeredProviders", JSON.stringify(updatedProviders));

                // Set provider session for immediate access to dashboard
                localStorage.setItem("providerSession", JSON.stringify(newProvider));
                
                // Also store in users for login system
                newUser.providerData = newProvider;
            }

            const updatedUsers = [...existingUsers, newUser];
            localStorage.setItem("users", JSON.stringify(updatedUsers));
            
            localStorage.setItem("currentUser", JSON.stringify(newUser));
            localStorage.setItem("token", "demo-token-" + Date.now());
            localStorage.setItem("role", formData.role);
            localStorage.setItem("userRole", formData.role);

            setSuccessMessage("Account created successfully! Redirecting...");
            
            setTimeout(() => {
                if (formData.role === "client") {
                    navigate("/client/create-profile");
                } else {
                    // For providers, go directly to dashboard (no additional profile needed)
                    navigate("/provider-dashboard");
                }
            }, 1500);
            
        } catch (err) {
            setError("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="form-container sign-up" style={{width: '100%', opacity: 1, zIndex: 5}}>
                    <form onSubmit={handleSubmit}>
                        <h1>Create Account</h1>
                        <span>Join our platform today</span>
                        
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                        
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        
                        <input
                            type="password"
                            name="password"
                            placeholder="Password (min. 6 characters)"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            minLength="6"
                        />
                        
                        {passwordStrength && (
                            <div style={{width: '100%'}}>
                                <div className="password-strength">
                                    <div className={`strength-bar strength-${passwordStrength}`}></div>
                                </div>
                                <div className="strength-text">
                                    {passwordStrength === 'weak' && 'Password strength: Weak'}
                                    {passwordStrength === 'medium' && 'Password strength: Medium'}
                                    {passwordStrength === 'strong' && 'Password strength: Strong'}
                                </div>
                            </div>
                        )}
                        
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        
                        <div className="role-selection">
                            <label>Account Type</label>
                            <div className="role-options">
                                <label className="role-option">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="client"
                                        checked={formData.role === "client"}
                                        onChange={handleChange}
                                    />
                                    Client
                                </label>
                                <label className="role-option">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="provider"
                                        checked={formData.role === "provider"}
                                        onChange={handleChange}
                                    />
                                    Provider
                                </label>
                            </div>
                        </div>

                        {/* Provider-specific fields */}
                        {showProviderFields && (
                            <div className="provider-fields">
                                <div className="form-section-divider">
                                    <span>Provider Information</span>
                                </div>
                                
                                <input
                                    type="text"
                                    name="serviceId"
                                    placeholder="Service ID (auto-generated from name)"
                                    required
                                    value={formData.serviceId}
                                    onChange={handleChange}
                                    readOnly
                                    style={{backgroundColor: '#f5f5f5'}}
                                />
                                
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Service Category</option>
                                    {serviceCategories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number (optional)"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Location/City (optional)"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                                
                                <div className="provider-note">
                                    <small>
                                        💡 As a provider, you'll be able to add products/services, 
                                        manage your offerings, and reach more customers.
                                    </small>
                                </div>
                            </div>
                        )}
                        
                        <label className="terms-checkbox">
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                required
                            />
                            I agree to Terms & Conditions
                        </label>
                        
                        <button type="submit" className={loading ? "loading" : ""} disabled={loading}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        <div style={{marginTop: '15px', textAlign: 'center'}}>
                            <p style={{fontSize: '11px', color: '#666'}}>
                                Already have an account?{" "}
                                <Link to="/login" style={{color: '#667eea', textDecoration: 'none', fontWeight: '500'}}>
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {error && (
                <div className="message error-message">
                    <span className="message-icon">⚠</span>
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="message success-message">
                    <span className="message-icon">✓</span>
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default Register;