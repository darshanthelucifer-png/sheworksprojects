// src/components/client/ClientProfilePage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./ClientProfilePage.css";

// Reusable Button component
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  className = "",
  ...props
}) => {
  const baseClasses = `btn btn-${variant} btn-${size} ${
    disabled ? "btn-disabled" : ""
  } ${loading ? "btn-loading" : ""}`;

  return (
    <motion.button
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {loading && <div className="btn-spinner"></div>}
      <span className={loading ? "btn-content-loading" : ""}>{children}</span>
    </motion.button>
  );
};

const IconButton = ({
  icon,
  onClick,
  variant = "primary",
  size = "medium",
  label,
  disabled = false,
  className = "",
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`btn-icon ${className}`}
    >
      <span className="btn-icon-content">{icon}</span>
      {label && <span className="btn-label">{label}</span>}
    </Button>
  );
};

const ClientProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    favoriteServices: 0,
  });

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Prefer currentUser, then fallback to user
      let userData =
        JSON.parse(localStorage.getItem("currentUser") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null") ||
        {};

      // If no token and no stored user → redirect to login
      if (!token && Object.keys(userData).length === 0) {
        setLoading(false);
        navigate("/login");
        return;
      }

      // Try to fetch fresh data from API (optional)
      if (token) {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/client/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data?.success && response.data.user) {
            userData = response.data.user;
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("currentUser", JSON.stringify(userData));
          }
        } catch (apiError) {
          console.log("Using cached user data");
        }
      }

      // Calculate stats from orders
      const orders = JSON.parse(localStorage.getItem("clientOrders") || "[]");
      const totalOrders = orders.length;
      const completedOrders = orders.filter(
        (o) => o.status === "completed" || o.tracking?.isCompleted
      ).length;
      const pendingOrders = orders.filter(
        (o) => o.status === "pending" || !o.tracking?.isCompleted
      ).length;
      const totalSpent = orders
        .filter((o) => o.status === "completed")
        .reduce(
          (sum, order) =>
            sum + parseFloat(order.amount?.toString().replace("₹", "") || 0),
          0
        );

      const favoriteServices =
        JSON.parse(localStorage.getItem("favoriteServices") || "[]") || [];

      setStats({
        totalOrders,
        completedOrders,
        pendingOrders,
        totalSpent,
        favoriteServices: favoriteServices.length,
      });

      // Enhance user data with safe defaults
      const enhancedUser = {
        name: "Client User",
        email: "user@example.com",
        phone: "Not provided",
        address: "Not provided",
        location: "Not specified",
        bio: "No bio provided yet. Tell us about yourself!",
        joinDate: new Date().toISOString(),
        ...userData,
      };

      setUser(enhancedUser);
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleEditProfile = () => navigate("/client/edit-profile");
  const handleViewOrders = () => navigate("/client/orders");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const getJoinDuration = () => {
    if (!user?.joinDate) return "Recently";
    const joinDate = new Date(user.joinDate);
    const months = Math.floor(
      (new Date() - joinDate) / (1000 * 60 * 60 * 24 * 30)
    );
    return months === 0 ? "This month" : `${months} month${months > 1 ? "s" : ""}`;
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <ErrorState
        onRetry={() => window.location.reload()}
        onGoHome={() => navigate("/client/dashboard")}
      />
    );
  }

  return (
    <motion.div
      className="client-profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header - Professional Style */}
      <div className="professional-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Client Profile</h1>
            <p className="page-subtitle">Welcome back, {user.name.split(" ")[0]}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="logout-button"
          >
            <span className="logout-icon">↪</span>
            Logout
          </Button>
        </div>
      </div>

      <div className="profile-content">
        {/* Profile Overview Card */}
        <ProfileOverview
          user={user}
          onEditProfile={handleEditProfile}
          joinDuration={getJoinDuration()}
        />

        {/* Stats Grid */}
        <StatsSection stats={stats} />

        {/* Quick Actions (ONLY "My Orders") */}
        <QuickActions onViewOrders={handleViewOrders} />

        {/* Recent Activity Section */}
        <ActivitySection
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onViewOrders={handleViewOrders}
        />
      </div>
    </motion.div>
  );
};

// ===== Sub-components =====

const ProfileOverview = ({ user, onEditProfile, joinDuration }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.1 }}
    className="profile-overview-card"
  >
    <div className="profile-main-info">
      <div className="profile-header-section">
        <div className="profile-title-section">
          <h2 className="profile-name">{user.name}</h2>
          <div className="member-tag">
            <span className="tag-icon">⭐</span>
            <span className="tag-text">Premium Client</span>
          </div>
        </div>
        
        <div className="profile-actions">
          <Button
            variant="primary"
            onClick={onEditProfile}
            className="edit-profile-button"
          >
            <span className="edit-icon">✎</span>
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="profile-details-grid">
        <div className="detail-item">
          <div className="detail-label">Email Address</div>
          <div className="detail-value">{user.email}</div>
        </div>
        
        <div className="detail-item">
          <div className="detail-label">Location</div>
          <div className="detail-value">{user.location}</div>
        </div>
        
        <div className="detail-item">
          <div className="detail-label">Member Since</div>
          <div className="detail-value">Joined {joinDuration} ago</div>
        </div>
        
        {user.phone && user.phone !== "Not provided" && (
          <div className="detail-item">
            <div className="detail-label">Phone</div>
            <div className="detail-value">{user.phone}</div>
          </div>
        )}
      </div>

      {user.bio && user.bio !== "No bio provided yet. Tell us about yourself!" && (
        <motion.div
          className="bio-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bio-label">About</div>
          <p className="bio-text">{user.bio}</p>
        </motion.div>
      )}
    </div>
  </motion.div>
);

const StatsSection = ({ stats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="stats-grid"
  >
    <StatCard
      icon="📊"
      label="Total Orders"
      value={stats.totalOrders}
      color="blue"
      description="All time orders"
    />
    <StatCard
      icon="✅"
      label="Completed"
      value={stats.completedOrders}
      color="green"
      description="Successful orders"
    />
    <StatCard
      icon="⏳"
      label="Pending"
      value={stats.pendingOrders}
      color="orange"
      description="In progress"
    />
    <StatCard
      icon="💰"
      label="Total Spent"
      value={`₹${stats.totalSpent}`}
      color="purple"
      description="Lifetime value"
    />
    <StatCard
      icon="❤️"
      label="Favorites"
      value={stats.favoriteServices}
      color="pink"
      description="Saved services"
    />
  </motion.div>
);

const QuickActions = ({ onViewOrders }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    className="quick-actions-grid"
  >
    <ActionCard
      icon="📋"
      title="My Orders"
      description="View and track your orders"
      onClick={onViewOrders}
      color="gradient-blue"
      delay={0}
    />
  </motion.div>
);

const ActivitySection = ({
  activeTab,
  onTabChange,
  onViewOrders,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.4 }}
    className="activity-section"
  >
    <div className="section-header">
      <h3 className="section-title">Recent Activity</h3>
      <div className="activity-tabs">
        <TabButton
          active={activeTab === "overview"}
          onClick={() => onTabChange("overview")}
          label="Overview"
        />
        <TabButton
          active={activeTab === "orders"}
          onClick={() => onTabChange("orders")}
          label="Orders"
        />
      </div>
    </div>

    <div className="activity-content">
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="overview-grid"
          >
            <RecentOrders onViewAll={onViewOrders} />
          </motion.div>
        )}

        {activeTab === "orders" && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <RecentOrders onViewAll={onViewOrders} showAll={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

// Reusable components

const StatCard = ({ icon, label, value, color, description }) => {
  return (
    <motion.div
      className={`stat-card stat-${color}`}
      whileHover={{
        scale: 1.03,
        y: -3,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        <div className="stat-description">{description}</div>
      </div>
    </motion.div>
  );
};

const ActionCard = ({ icon, title, description, onClick, color, delay }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`action-card ${color}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        scale: 1.03,
        y: -3,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="action-arrow">→</div>
    </motion.button>
  );
};

const TabButton = ({ active, onClick, label }) => (
  <Button
    variant={active ? "primary" : "ghost"}
    size="medium"
    onClick={onClick}
    className={`tab-btn ${active ? "active" : ""}`}
  >
    {label}
  </Button>
);

const RecentOrders = ({ onViewAll, showAll = false }) => {
  const navigate = useNavigate();
  const orders = JSON.parse(localStorage.getItem("clientOrders") || "[]");
  const displayOrders = showAll ? orders : orders.slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "status-completed";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  return (
    <div className="recent-orders">
      <div className="section-header">
        <h4>Recent Orders</h4>
        {!showAll && (
          <Button
            variant="ghost"
            size="small"
            onClick={onViewAll}
            className="view-all-btn"
          >
            View All <span>→</span>
          </Button>
        )}
      </div>
      <div className="orders-list">
        {displayOrders.length > 0 ? (
          displayOrders.map((order, index) => (
            <motion.div
              key={index}
              className="order-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="order-info">
                <div className="order-service">{order.serviceType || "Service"}</div>
                <div className="order-date">
                  {new Date(order.bookingDate || order.date || Date.now()).toLocaleDateString()}
                </div>
              </div>
              <div className="order-meta">
                <span className={`status-badge ${getStatusColor(order.status)}`}>
                  {order.status || "pending"}
                </span>
                {order.amount && (
                  <span className="order-amount">{order.amount}</span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <EmptyState
            icon="📦"
            message="No orders yet"
            actionLabel="Explore Services"
            onAction={() => navigate("/categories")}
          />
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ icon, message, actionLabel, onAction }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="empty-icon">{icon}</div>
      <p>{message}</p>
      <Button
        variant="primary"
        size="small"
        onClick={onAction || (() => navigate("/categories"))}
        className="explore-btn"
      >
        {actionLabel}
      </Button>
    </motion.div>
  );
};

const LoadingState = () => (
  <motion.div
    className="profile-loading-container"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="loading-content">
      <div className="loading-spinner-large"></div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="loading-text"
      >
        Loading profile data...
      </motion.p>
    </div>
  </motion.div>
);

const ErrorState = ({ onRetry, onGoHome }) => (
  <motion.div
    className="profile-error-container"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="error-content">
      <div className="error-icon">⚠️</div>
      <h2>Unable to Load Profile</h2>
      <p>There was an issue loading your profile data. Please try again.</p>
      <div className="error-actions">
        <Button variant="primary" onClick={onRetry} className="retry-btn">
          Try Again
        </Button>
        <Button
          variant="ghost"
          onClick={onGoHome}
          className="home-btn"
          style={{ marginLeft: "12px" }}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  </motion.div>
);

export default ClientProfilePage;
