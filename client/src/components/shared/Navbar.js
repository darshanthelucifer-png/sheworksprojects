import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { ArrowLeft, ShoppingCart, Settings, Shield, User, LogOut } from "lucide-react";

// ✅ global logout helper (path: src/utils/auth.js)
import { logout } from "../../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  // ✅ SAFER: load user & merge stored role
  let storedUser = {};
  try {
    const rawCurrent = localStorage.getItem("currentUser");
    const rawLegacy = localStorage.getItem("user");
    if (rawCurrent) {
      storedUser = JSON.parse(rawCurrent);
    } else if (rawLegacy) {
      storedUser = JSON.parse(rawLegacy);
    }
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
    storedUser = {};
  }

  const storedRole = localStorage.getItem("role");
  const user = {
    ...storedUser,
    role: storedUser.role || storedRole || undefined,
  };

  // Function to get cart item count
  const getCartItemCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("clientCart") || "[]");
      return cart.reduce((total, item) => total + (item.quantity || 1), 0);
    } catch (error) {
      console.error("Error reading cart:", error);
      return 0;
    }
  };

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      setCartItemCount(getCartItemCount());
    };

    updateCartCount();
    const interval = setInterval(updateCartCount, 1000);
    return () => clearInterval(interval);
  }, []);

  // Debug function to check user data
  const debugUserData = () => {
    console.log("🔍 User Data Debug:");
    console.log("currentUser:", JSON.parse(localStorage.getItem("currentUser") || "{}"));
    console.log("user (legacy):", JSON.parse(localStorage.getItem("user") || "{}"));
    console.log("role key:", localStorage.getItem("role"));
    console.log("token:", localStorage.getItem("token"));
  };

  // Hide navbar on auth pages ONLY by path
  const hideNavbarPaths = ["/login", "/register", "/", "/provider/login", "/admin/login"];
  const hideNavbar = hideNavbarPaths.includes(location.pathname);

  if (hideNavbar) {
    return null;
  }

  // If still no role, hide and debug
  if (!user?.role) {
    console.log("🚫 Hiding navbar - No user role found");
    debugUserData();
    return null;
  }

  // Check if user is admin
  const isAdmin = user?.role === "admin" || user?.email?.includes("admin");

  // Handle avatar click
  const handleAvatarClick = () => {
    if (user.role === "client") navigate("/client/profile");
    else if (user.role === "provider") navigate("/provider/profile");
    else if (user.role === "admin") navigate("/admin");
    else navigate("/login");
  };

  // Handle admin panel click
  const handleAdminClick = () => {
    if (isAdmin) navigate("/admin");
  };

  // ✅ LOGOUT — removes ALL session keys
  const handleLogout = () => {
    logout(); 
    navigate("/login");
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-left">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>

        <div className="navbar-logo" onClick={() => navigate("/")}>
          <span className="navbar-logo-main">SheWorks</span>
          {isAdmin && <span className="admin-badge">ADMIN</span>}
        </div>
      </div>

      {/* 🔹 Navigation Links */}
      <div className="navbar-links">
        {/* CLIENT NAV ITEMS */}
        {user.role === "client" && (
          <>
            <NavLink to="/client/dashboard" className="nav-item">
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/client/orders" className="nav-item">
              <span>Orders</span>
            </NavLink>

            <NavLink to="/client/cart" className="nav-item cart-link">
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="cart-badge">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </NavLink>
          </>
        )}

        {/* PROVIDER NAV ITEMS */}
        {user.role === "provider" && (
          <>
            <NavLink to="/provider/dashboard" className="nav-item">
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/provider/services" className="nav-item">
              <span>My Services</span>
            </NavLink>

            <NavLink to="/provider/manage-bookings" className="nav-item">
              <span>Bookings</span>
            </NavLink>
          </>
        )}

        {/* ADMIN NAV ITEMS */}
        {user.role === "admin" && (
          <>
            <NavLink to="/admin" className="nav-item">
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/orders" className="nav-item">
              <span>Orders</span>
            </NavLink>
            <NavLink to="/admin/providers" className="nav-item">
              <span>Providers</span>
            </NavLink>
            <NavLink to="/admin/users" className="nav-item">
              <span>Users</span>
            </NavLink>
            <NavLink to="/admin/analytics" className="nav-item">
              <span>Analytics</span>
            </NavLink>
            <NavLink to="/admin/settings" className="nav-item">
              <span>Settings</span>
            </NavLink>
          </>
        )}

        {isAdmin && user.role !== "admin" && (
          <button
            className="nav-item admin-quick-access"
            onClick={handleAdminClick}
            title="Go to Admin Panel"
          >
            <Shield size={16} />
            <span>Admin</span>
          </button>
        )}
      </div>

      {/* User menu */}
      <div className="navbar-user-section">
        {isAdmin && user.role !== "admin" && (
          <button
            className="admin-switch-btn"
            onClick={handleAdminClick}
            title="Switch to Admin Panel"
          >
            <Shield size={16} />
          </button>
        )}

        <div className="user-menu-container">
          <div
            className="navbar-avatar"
            onClick={() => setShowAdminMenu(!showAdminMenu)}
            title={`${user.name || "User"} - ${user.role}`}
          >
            {(user.profileImage || user.profilePic) && (
              <img
                src={user.profileImage || user.profilePic}
                alt="avatar"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}

            <div className="avatar-placeholder">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <span className="user-role-badge">{user.role}</span>
          </div>

          {showAdminMenu && (
            <div className="user-dropdown-menu">
              <div className="dropdown-header">
                <div className="user-info">
                  <strong>{user.name || "User"}</strong>
                  <span className="user-email">{user.email}</span>
                  <span className="user-role-pill">{user.role?.toUpperCase()}</span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <div className="dropdown-items">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    handleAvatarClick();
                    setShowAdminMenu(false);
                  }}
                >
                  <User size={16} className="dropdown-icon" />
                  <span>My Profile</span>
                </button>

                {isAdmin && (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/admin");
                      setShowAdminMenu(false);
                    }}
                  >
                    <Shield size={16} className="dropdown-icon" />
                    <span>Admin Panel</span>
                  </button>
                )}

                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate(`/${user.role}/settings`);
                    setShowAdminMenu(false);
                  }}
                >
                  <Settings size={16} className="dropdown-icon" />
                  <span>Settings</span>
                </button>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="dropdown-icon" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAdminMenu && (
        <div
          className="dropdown-overlay"
          onClick={() => setShowAdminMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
