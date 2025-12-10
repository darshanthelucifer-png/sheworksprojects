import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { manualProviders } from "../../data/manualProviders";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    conversionRate: 0,
    averageOrderValue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const navigate = useNavigate();

  const safeAmount = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const cleaned = val.replace(/[^\d]/g, "");
      return cleaned ? parseInt(cleaned) : 0;
    }
    return 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const loadDashboardData = useCallback(() => {
    try {
      setLoading(true);
      
      // Get data from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const registeredProviders = JSON.parse(localStorage.getItem("registeredProviders") || "[]");
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      const clientOrders = JSON.parse(localStorage.getItem("clientOrders") || "[]");

      const allProviders = [
        ...manualProviders.filter(p => p.isActive !== false),
        ...registeredProviders
      ];

      // Combine and deduplicate orders
      const allOrders = [...bookings, ...clientOrders];
      const uniqueOrders = allOrders.filter((order, index, self) =>
        index === self.findIndex((o) => o.id === order.id)
      );

      // Filter orders by time range
      const filteredOrders = filterOrdersByTimeRange(uniqueOrders, timeRange);
      
      // Calculate order stats
      const completed = filteredOrders.filter(o => ["completed", "delivered"].includes((o.status || "").toLowerCase()));
      const pending = filteredOrders.filter(o => ["pending", "accepted"].includes((o.status || "").toLowerCase()));

      const totalRevenue = filteredOrders.reduce((sum, order) => sum + safeAmount(order.amount || order.price), 0);

      const conversionRate = users.length > 0 ? (filteredOrders.length / users.length) * 100 : 0;
      const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

      // Update stats
      setStats({
        totalUsers: users.length,
        totalProviders: allProviders.length,
        totalOrders: filteredOrders.length,
        totalRevenue: totalRevenue,
        pendingOrders: pending.length,
        completedOrders: completed.length,
        conversionRate: conversionRate,
        averageOrderValue: averageOrderValue
      });

      // Get recent orders (last 5)
      const recent = filteredOrders
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5);
      setRecentOrders(recent);

      // Calculate top providers based on orders
      const providerStats = {};
      filteredOrders.forEach(order => {
        const providerId = order.providerId || order.provider;
        if (providerId) {
          if (!providerStats[providerId]) {
            const provider = allProviders.find(p => p.id === providerId) || { name: 'Unknown Provider', category: 'General' };
            providerStats[providerId] = {
              name: provider.name,
              orders: 0,
              revenue: 0,
              rating: provider.rating || 0,
              category: provider.category || 'General'
            };
          }
          providerStats[providerId].orders++;
          const amount = safeAmount(order.amount || order.price);
          providerStats[providerId].revenue += amount;
        }
      });

      const topProvidersList = Object.entries(providerStats)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopProviders(topProvidersList);

    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const filterOrdersByTimeRange = (orders, range) => {
    const now = new Date();
    switch (range) {
      case "today":
        return orders.filter(order => {
          const orderDate = new Date(order.bookingDate || order.date || order.createdAt);
          return orderDate.toDateString() === now.toDateString();
        });
      case "week":
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orders.filter(order => new Date(order.bookingDate || order.date || order.createdAt) >= weekAgo);
      case "month":
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orders.filter(order => new Date(order.bookingDate || order.date || order.createdAt) >= monthAgo);
      default:
        return orders;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'status-completed';
      case 'pending':
      case 'accepted':
        return 'status-pending';
      case 'cancelled':
      case 'rejected':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="admin-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-spinner"></div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Loading Admin Dashboard...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="admin-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Sidebar */}
      <motion.div 
        className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="sidebar-brand">
          <motion.h2
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            🏢 SheWorks
          </motion.h2>
          <p>Admin Panel</p>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>MAIN NAVIGATION</h3>
            <ul>
              <motion.li 
                className="nav-item active"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </motion.li>
              <motion.li 
                className="nav-item"
                onClick={() => navigate("/admin/users")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-text">Users</span>
                <span className="nav-badge">{stats.totalUsers}</span>
              </motion.li>
              <motion.li 
                className="nav-item"
                onClick={() => navigate("/admin/providers")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <span className="nav-icon">🏪</span>
                <span className="nav-text">Providers</span>
                <span className="nav-badge">{stats.totalProviders}</span>
              </motion.li>
              <motion.li 
                className="nav-item"
                onClick={() => navigate("/admin/orders")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <span className="nav-icon">📦</span>
                <span className="nav-text">Orders</span>
                <span className="nav-badge">{stats.totalOrders}</span>
              </motion.li>
            </ul>
          </div>

          <div className="nav-section">
            <h3>ANALYTICS</h3>
            <ul>
              <motion.li 
                className="nav-item"
                onClick={() => navigate("/admin/reports")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <span className="nav-icon">📈</span>
                <span className="nav-text">Reports</span>
              </motion.li>
              <motion.li 
                className="nav-item"
                onClick={() => navigate("/admin/analytics")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Analytics</span>
              </motion.li>
            </ul>
          </div>

          <div className="nav-section">
            <h3>SETTINGS</h3>
            <ul>
              <motion.li 
                className="nav-item"
                onClick={() => navigate("/admin/settings")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <span className="nav-icon">⚙️</span>
                <span className="nav-text">Settings</span>
              </motion.li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <motion.button 
            className="logout-btn"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Enhanced Header */}
        <motion.header 
          className="dashboard-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-left">
            <motion.button 
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ☰
            </motion.button>
            <div className="header-title">
              <h1>Dashboard Overview</h1>
              <p>Welcome back, Admin! Here's what's happening today.</p>
            </div>
          </div>
          
          <div className="header-right">
            <div className="view-tabs">
              {['overview', 'performance', 'revenue'].map(view => (
                <button
                  key={view}
                  className={`view-tab ${activeView === view ? 'active' : ''}`}
                  onClick={() => setActiveView(view)}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
            <select 
              className="time-filter"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <div className="user-menu">
              <div className="user-avatar">A</div>
              <span>Admin User</span>
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <div className="dashboard-content">
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="overview-content"
              >
                {/* Enhanced Stats Grid */}
                <div className="stats-grid">
                  <StatCard
                    icon="📦"
                    title="Total Orders"
                    value={formatNumber(stats.totalOrders)}
                    change="+12%"
                    changeType="positive"
                    description="All time orders"
                    delay={0}
                  />
                  <StatCard
                    icon="💰"
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    change="+18%"
                    changeType="positive"
                    description="Platform revenue"
                    delay={0.1}
                  />
                  <StatCard
                    icon="👥"
                    title="Registered Users"
                    value={formatNumber(stats.totalUsers)}
                    change="+8%"
                    changeType="positive"
                    description="Active users"
                    delay={0.2}
                  />
                  <StatCard
                    icon="🏪"
                    title="Active Providers"
                    value={formatNumber(stats.totalProviders)}
                    change="+15%"
                    changeType="positive"
                    description="Service providers"
                    delay={0.3}
                  />
                  <StatCard
                    icon="✅"
                    title="Completed Orders"
                    value={formatNumber(stats.completedOrders)}
                    change="+22%"
                    changeType="positive"
                    description="Successful deliveries"
                    delay={0.4}
                  />
                  <StatCard
                    icon="⏳"
                    title="Pending Orders"
                    value={formatNumber(stats.pendingOrders)}
                    change="+5%"
                    changeType="warning"
                    description="Awaiting completion"
                    delay={0.5}
                  />
                </div>

                {/* Charts and Data */}
                <div className="dashboard-row">
                  {/* Recent Orders */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="data-card"
                  >
                    <div className="card-header">
                      <h3>📋 Recent Orders</h3>
                      <div className="card-actions">
                        <span className="badge">{recentOrders.length} new</span>
                        <button className="view-all-btn">View All</button>
                      </div>
                    </div>
                    <div className="card-content">
                      {recentOrders.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">📦</div>
                          <p>No recent orders</p>
                          <button className="action-btn" onClick={loadDashboardData}>Refresh</button>
                        </div>
                      ) : (
                        <div className="orders-list">
                          {recentOrders.map((order, index) => (
                            <motion.div
                              key={order.id || index}
                              className="order-item"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="order-info">
                                <h4>{order.serviceType || order.service || 'Custom Service'}</h4>
                                <p>{order.clientName || order.customerName || 'Unknown Client'}</p>
                                <span className="order-date">
                                  {new Date(order.bookingDate || order.date || order.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="order-meta">
                                <span className={`status ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                                <span className="order-amount">
                                  {order.amount || formatCurrency(safeAmount(order.price))}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Top Providers */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="data-card"
                  >
                    <div className="card-header">
                      <h3>⭐ Top Providers</h3>
                      <button className="view-all-btn">See All</button>
                    </div>
                    <div className="card-content">
                      {topProviders.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">🏪</div>
                          <p>No provider data available</p>
                        </div>
                      ) : (
                        <div className="providers-list">
                          {topProviders.map((provider, index) => (
                            <motion.div
                              key={provider.id || index}
                              className="provider-item"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="provider-rank">
                                <span className={`rank-badge rank-${index + 1}`}>
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="provider-avatar">
                                <div className="avatar-img">
                                  {provider.name.charAt(0)}
                                </div>
                              </div>
                              <div className="provider-info">
                                <h4>{provider.name}</h4>
                                <div className="provider-meta">
                                  <span className="provider-category">{provider.category}</span>
                                  <div className="provider-stats">
                                    <span>{provider.orders} orders</span>
                                    <span>•</span>
                                    <span>{formatCurrency(provider.revenue)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="provider-rating">
                                ⭐ {provider.rating || '4.5'}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Platform Health */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="data-card full-width"
                >
                  <div className="card-header">
                    <h3>📈 Platform Health</h3>
                    <div className="health-summary">
                      <span className="health-score">Excellent</span>
                      <span className="score-dot"></span>
                    </div>
                  </div>
                  <div className="health-metrics">
                    <HealthMetric
                      label="Order Completion Rate"
                      value={stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}
                      format="percentage"
                      color="primary"
                    />
                    <HealthMetric
                      label="Conversion Rate"
                      value={stats.conversionRate}
                      format="percentage"
                      color="success"
                    />
                    <HealthMetric
                      label="Average Order Value"
                      value={stats.averageOrderValue}
                      format="currency"
                      color="warning"
                    />
                    <HealthMetric
                      label="Customer Satisfaction"
                      value={4.7}
                      format="rating"
                      color="info"
                    />
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="quick-actions-card"
                >
                  <h3>🚀 Quick Actions</h3>
                  <div className="actions-grid">
                    <motion.button 
                      className="action-btn primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/admin/analytics")}
                    >
                      <span className="action-icon">📊</span>
                      View Analytics
                    </motion.button>
                    <motion.button 
                      className="action-btn success"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/admin/reports")}
                    >
                      <span className="action-icon">📈</span>
                      Generate Report
                    </motion.button>
                    <motion.button 
                      className="action-btn warning"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/admin/users")}
                    >
                      <span className="action-icon">👥</span>
                      Manage Users
                    </motion.button>
                    <motion.button 
                      className="action-btn info"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/admin/providers")}
                    >
                      <span className="action-icon">🏪</span>
                      View Providers
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, change, changeType, description, delay }) => {
  return (
    <motion.div
      className={`stat-card stat-${changeType}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { duration: 0.3 }
      }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        <div className="stat-footer">
          <span className={`change-indicator ${changeType}`}>
            {change}
          </span>
          <span className="stat-description">{description}</span>
        </div>
      </div>
      <div className="stat-decoration"></div>
    </motion.div>
  );
};

// Health Metric Component
const HealthMetric = ({ label, value, format, color }) => {
  const formatValue = () => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(value);
      case 'rating':
        return `${value}/5.0`;
      default:
        return value;
    }
  };

  return (
    <div className="health-item">
      <div className="health-header">
        <span className="health-label">{label}</span>
        <span className={`health-value ${color}`}>{formatValue()}</span>
      </div>
      <div className="health-progress">
        <div 
          className={`health-progress-bar ${color}`}
          style={{ width: `${format === 'rating' ? (value / 5) * 100 : Math.min(value, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AdminDashboard;