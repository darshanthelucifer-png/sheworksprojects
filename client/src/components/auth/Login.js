import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import { manualProviders } from "../../data/manualProviders";

const Login = () => {
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    // Form states
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
        role: "client",
        rememberMe: false
    });

    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "client",
        category: "",
        location: "",
        phone: "",
        agreeToTerms: false
    });

    // Demo credentials
    const demoCredentials = {
        client: { email: "client@demo.com", password: "demo123" },
        provider: { email: "provider@demo.com", password: "demo123" },
        admin: { email: "admin@sheworks.com", password: "admin123" }
    };

    // Service categories
    const serviceCategories = [
        "Embroidery", "Home Cooked Food", "Custom Gifts", "Arts & Crafts", 
        "Fashion & Tailoring", "Beauty & Wellness", "Sugar Bloom", 
        "Event Decoration", "Home Gardening Kits", "Traditional Festival Kits"
    ];

    useEffect(() => {
        initializeLocalStorage();
        checkRememberedEmail();
        setError("");
    }, []);

    const initializeLocalStorage = () => {
        // Initialize users array
        if (!localStorage.getItem("users")) {
            localStorage.setItem("users", JSON.stringify([]));
        }
        
        // Initialize registered providers array
        if (!localStorage.getItem("registeredProviders")) {
            localStorage.setItem("registeredProviders", JSON.stringify([]));
        }
        
        // Store manual providers
        const allProviders = manualProviders.map(provider => ({
            id: provider.id,
            name: provider.name,
            email: provider.email,
            password: provider.password,
            serviceId: provider.serviceId,
            category: provider.category,
            location: provider.location,
            phone: provider.phone,
            experience: provider.experience,
            description: provider.description,
            services: provider.services,
            priceRange: provider.priceRange,
            rating: provider.rating,
            reviews: provider.reviews,
            imagePath: provider.imagePath,
            isActive: provider.isActive,
            providerType: "manual",
            featured: provider.featured,
            createdAt: new Date().toISOString()
        }));
        
        localStorage.setItem("manualProviders", JSON.stringify(allProviders));
        console.log(`✅ Loaded ${allProviders.length} manual providers`);
    };

    const checkRememberedEmail = () => {
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
            setLoginData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
        }
    };

    // Login Handlers
    const handleLoginChange = (e) => {
        const { name, value, type, checked } = e.target;
        setError("");
        setSuccessMessage("");
        setLoginData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // Registration Handlers
    const handleRegisterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setError("");
        setSuccessMessage("");
        
        const newData = {
            ...registerData,
            [name]: type === "checkbox" ? checked : value
        };

        // Auto-generate serviceId from name for providers
        if (name === "name" && registerData.role === "provider") {
            const serviceId = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            newData.serviceId = serviceId;
        }

        setRegisterData(newData);
    };

    const validateLoginForm = () => {
        if (!loginData.email.trim() || !loginData.password.trim()) {
            setError("Please fill in all fields.");
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginData.email.trim())) {
            setError("Please enter a valid email address.");
            return false;
        }
        
        if (loginData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return false;
        }
        
        return true;
    };

    const validateRegisterForm = () => {
        const { name, email, password, confirmPassword, role, category, agreeToTerms } = registerData;

        if (!name || !email || !password || !confirmPassword || !role) {
            setError("Please fill in all required fields.");
            return false;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return false;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid email address.");
            return false;
        }

        if (role === "provider" && !category) {
            setError("Please select a service category.");
            return false;
        }

        if (!agreeToTerms) {
            setError("Please agree to the Terms & Conditions.");
            return false;
        }

        return true;
    };

    const handleAdminLogin = () => {
        const admin = {
            id: "admin-001",
            name: "System Administrator",
            email: demoCredentials.admin.email,
            role: "admin"
        };
        handleLoginSuccess(admin, "admin", true);
    };

    const handleLoginSuccess = (user, role, isAutoLogin = false) => {
        const token = `token-${Date.now()}`;
        const userData = {
            ...user,
            lastLogin: new Date().toISOString()
        };

        // Store session data
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("userRole", role);

        // Role-specific sessions
        if (role === "provider") {
            localStorage.setItem("providerSession", JSON.stringify(userData));
        } else if (role === "admin") {
            localStorage.setItem("adminSession", JSON.stringify(userData));
            localStorage.setItem("adminToken", token);
        }

        // Remember email if requested
        if (loginData.rememberMe) {
            localStorage.setItem("rememberedEmail", userData.email);
        } else {
            localStorage.removeItem("rememberedEmail");
        }

        if (!isAutoLogin) {
            setSuccessMessage(`Welcome back, ${user.name || userData.email}!`);
        }

        // Redirect based on role
        const redirectPaths = {
            admin: "/admin/dashboard",
            provider: "/provider/dashboard",
            client: "/client/dashboard"
        };

        setTimeout(() => navigate(redirectPaths[role]), 1000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateLoginForm()) return;

        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const { email, password, role } = loginData;

            // Admin login
            if (role === "admin") {
                if (email === demoCredentials.admin.email && password === demoCredentials.admin.password) {
                    handleLoginSuccess(
                        {
                            id: "admin-001",
                            name: "System Administrator",
                            email: email
                        },
                        "admin"
                    );
                    return;
                } else {
                    setError("Invalid admin credentials.");
                    setLoading(false);
                    return;
                }
            }

            // Check existing users
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const userMatch = users.find(
                u =>
                    u.email?.toLowerCase() === email.toLowerCase() &&
                    u.password === password &&
                    u.role === role
            );

            if (userMatch) {
                console.log("User matched:", userMatch.name);
                handleLoginSuccess(userMatch, role);
                return;
            }

            // Provider login - check both manual and registered providers
            if (role === "provider") {
                // Check manual providers
                const manualProvidersArr = JSON.parse(localStorage.getItem("manualProviders") || "[]");
                const manualProviderMatch = manualProvidersArr.find(
                    p =>
                        p.email?.toLowerCase() === email.toLowerCase() &&
                        p.password === password &&
                        p.isActive !== false
                );

                if (manualProviderMatch) {
                    console.log("Manual provider matched:", manualProviderMatch.name);
                    await syncProviderToUsers(manualProviderMatch, "manual");
                    handleLoginSuccess(manualProviderMatch, "provider");
                    return;
                }

                // Check registered providers
                const registeredProviders = JSON.parse(localStorage.getItem("registeredProviders") || "[]");
                const registeredProviderMatch = registeredProviders.find(
                    p =>
                        p.email?.toLowerCase() === email.toLowerCase() &&
                        p.password === password
                );

                if (registeredProviderMatch) {
                    console.log("Registered provider matched:", registeredProviderMatch.name);
                    await syncProviderToUsers(registeredProviderMatch, "registered");
                    handleLoginSuccess(registeredProviderMatch, "provider");
                    return;
                }
            }

            setError("Invalid email, password, or account type selected.");
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const syncProviderToUsers = async (provider, type) => {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        
        // Check if provider already exists in users
        if (!users.find(u => u.email === provider.email && u.role === "provider")) {
            const userData = {
                id: provider.id,
                name: provider.name,
                email: provider.email,
                password: provider.password,
                role: "provider",
                profileCompleted: true,
                serviceId: provider.serviceId,
                category: provider.category,
                location: provider.location,
                phone: provider.phone,
                providerData: provider,
                createdAt: provider.createdAt || new Date().toISOString()
            };

            users.push(userData);
            localStorage.setItem("users", JSON.stringify(users));
            console.log(`✅ Synced ${type} provider to users:`, provider.name);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateRegisterForm()) return;

        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const { name, email, password, role, category, location, phone } = registerData;

            // Check if user already exists
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const existingUser = users.find(u => u.email === email && u.role === role);
            
            if (existingUser) {
                setError("An account with this email already exists for the selected role.");
                setLoading(false);
                return;
            }

            // Create new user
            const newUser = {
                id: `user-${Date.now()}`,
                name: name,
                email: email.toLowerCase(),
                password: password,
                role: role,
                profileCompleted: role === "provider", // Providers complete profile during registration
                createdAt: new Date().toISOString()
            };

            // Handle provider registration
            if (role === "provider") {
                const serviceId = registerData.serviceId || name.toLowerCase().replace(/\s+/g, '_');
                
                const newProvider = {
                    id: `PROV_${Date.now()}`,
                    name: name,
                    email: email.toLowerCase(),
                    password: password,
                    serviceId: serviceId,
                    category: category,
                    phone: phone || "Not provided",
                    location: location || "Not specified",
                    rating: 0,
                    reviews: 0,
                    experience: "New provider",
                    description: `${category} service provider`,
                    isActive: true,
                    providerType: "registered",
                    profileCompleted: true,
                    createdAt: new Date().toISOString()
                };

                // Save to registered providers
                const existingProviders = JSON.parse(localStorage.getItem("registeredProviders") || "[]");
                const updatedProviders = [...existingProviders, newProvider];
                localStorage.setItem("registeredProviders", JSON.stringify(updatedProviders));

                // Add provider data to user
                newUser.providerData = newProvider;
                newUser.serviceId = newProvider.serviceId;
                newUser.category = newProvider.category;
                newUser.location = newProvider.location;
                newUser.phone = newProvider.phone;

                console.log("Registered new provider:", newProvider);
            }

            // Save user
            const updatedUsers = [...users, newUser];
            localStorage.setItem("users", JSON.stringify(updatedUsers));

            setSuccessMessage(`Account created successfully! You can now login as ${role}.`);
            
            // Reset registration form
            setRegisterData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "client",
                category: "",
                location: "",
                phone: "",
                agreeToTerms: false
            });

            // Switch to login form after successful registration
            setTimeout(() => {
                setIsActive(false);
                setLoginData(prev => ({ ...prev, email: email }));
            }, 2000);

        } catch (err) {
            console.error("Registration error:", err);
            setError("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className={`auth-wrapper ${isActive ? "active" : ""}`} id="authWrapper">
                
                {/* Registration Form */}
                <div className="form-container sign-up">
                    <form onSubmit={handleRegister}>
                        <h1>Create Account</h1>
                        <span>Join SheWorks community</span>
                        
                        <input 
                            type="text" 
                            placeholder="Full Name *" 
                            name="name"
                            value={registerData.name}
                            onChange={handleRegisterChange}
                            required
                        />
                        
                        <input 
                            type="email" 
                            placeholder="Email Address *" 
                            name="email"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            required
                        />
                        
                        <input 
                            type="password" 
                            placeholder="Password (min 6 characters) *" 
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            minLength="6"
                            required
                        />
                        
                        <input 
                            type="password" 
                            placeholder="Confirm Password *" 
                            name="confirmPassword"
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
                            required
                        />
                        
                        <div className="role-selection">
                            <label>I want to join as: *</label>
                            <div className="role-options">
                                <label className="role-option">
                                    <input 
                                        type="radio" 
                                        name="role" 
                                        value="client" 
                                        checked={registerData.role === "client"}
                                        onChange={handleRegisterChange}
                                    /> 
                                    <span className="role-icon">👤</span> Client
                                </label>
                                <label className="role-option">
                                    <input 
                                        type="radio" 
                                        name="role" 
                                        value="provider"
                                        checked={registerData.role === "provider"}
                                        onChange={handleRegisterChange}
                                    />
                                    <span className="role-icon">💼</span> Provider
                                </label>
                            </div>
                        </div>

                        {/* Provider-specific fields */}
                        {registerData.role === "provider" && (
                            <div className="provider-fields">
                                <select 
                                    name="category"
                                    value={registerData.category}
                                    onChange={handleRegisterChange}
                                    required
                                    className="form-select"
                                >
                                    <option value="">Select Service Category *</option>
                                    {serviceCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                
                                <input 
                                    type="text" 
                                    placeholder="Location" 
                                    name="location"
                                    value={registerData.location}
                                    onChange={handleRegisterChange}
                                />
                                
                                <input 
                                    type="tel" 
                                    placeholder="Phone Number" 
                                    name="phone"
                                    value={registerData.phone}
                                    onChange={handleRegisterChange}
                                />
                                
                                {registerData.serviceId && (
                                    <div className="service-id-display">
                                        <small>Service ID: <strong>{registerData.serviceId}</strong></small>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <label className="terms-checkbox">
                            <input 
                                type="checkbox" 
                                name="agreeToTerms"
                                checked={registerData.agreeToTerms}
                                onChange={handleRegisterChange}
                                required
                            />
                            I agree to the Terms & Conditions *
                        </label>
                        
                        <button type="submit" className={loading ? "loading" : ""} disabled={loading}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>

                        <div className="auth-switch">
                            Already have an account?{" "}
                            <span onClick={() => setIsActive(false)} className="switch-link">
                                Sign In
                            </span>
                        </div>
                    </form>
                </div>

                {/* Login Form */}
                <div className="form-container sign-in">
                    <form onSubmit={handleLogin}>
                        <h1>Sign In</h1>
                        <span>Welcome back to SheWorks</span>
                        
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            name="email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                        />
                        
                        <input 
                            type="password" 
                            placeholder="Password" 
                            name="password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            required
                        />
                        
                        <div className="role-selection">
                            <label>I am a:</label>
                            <select 
                                name="role"
                                value={loginData.role}
                                onChange={handleLoginChange}
                                className="role-select"
                            >
                                <option value="client">Client</option>
                                <option value="provider">Service Provider</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input 
                                    type="checkbox" 
                                    name="rememberMe"
                                    checked={loginData.rememberMe}
                                    onChange={handleLoginChange}
                                />
                                Remember me
                            </label>
                            <a href="#" className="forgot-link">Forgot Password?</a>
                        </div>
                        
                        <button type="submit" className={loading ? "loading" : ""} disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </button>

                        <div className="auth-switch">
                            Don't have an account?{" "}
                            <span onClick={() => setIsActive(true)} className="switch-link">
                                Sign Up
                            </span>
                        </div>
                    </form>
                </div>

                {/* Toggle Container */}
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all of site features</p>
                            <button className="hidden" onClick={() => setIsActive(false)}>
                                Sign In
                            </button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Hello, Friend!</h1>
                            <p>Register with your personal details to use all of site features</p>
                            <button className="hidden" onClick={() => setIsActive(true)}>
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="message error-message">
                    <span className="message-icon">⚠️</span>
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="message success-message">
                    <span className="message-icon">✅</span>
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default Login;