// src/components/client/ClientOrdersPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./ClientOrdersPage.css";

const ClientOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = "http://localhost:5000/api";

  // ✅ UPDATED: Delivery Style Tracking Stages
  const generateTrackingDetails = (order) => {
    const orderTime = new Date(order.bookingDate || order.date || new Date());
    const serviceTime = new Date(order.serviceDate || orderTime);

    const steps = [
      {
        status: "Order Confirmed",
        description: "Your order has been successfully confirmed.",
        timestamp: orderTime.toISOString(),
        icon: "✅"
      },
      {
        status: "Preparing Order",
        description: "Service provider is preparing/packing your order.",
        timestamp: new Date(orderTime.getTime() + 10 * 60000).toISOString(),
        icon: "📦"
      },
      {
        status: "Out for Delivery",
        description: "Your order is on the way.",
        timestamp: new Date(serviceTime.getTime()).toISOString(),
        icon: "🚚"
      },
      {
        status: "Completed",
        description: "Your order has been delivered / service completed.",
        timestamp: new Date(serviceTime.getTime() + 60 * 60000).toISOString(),
        icon: "🎉"
      }
    ];

    let currentStep = 0;
    let currentStatus = steps[0].status;

    switch ((order.status || "").toLowerCase()) {
      case "pending":
      case "order confirmed":
        currentStep = 0;
        break;
      case "preparing":
        currentStep = 1;
        currentStatus = "Preparing Order";
        break;
      case "out for delivery":
        currentStep = 2;
        currentStatus = "Out for Delivery";
        break;
      case "completed":
        currentStep = 3;
        currentStatus = "Completed";
        break;
    }

    return {
      currentStatus,
      statusHistory: steps,
      currentStep,
      isCompleted: currentStep === 3,
      lastUpdated: new Date().toISOString()
    };
  };

  const calculateOrderStats = (ordersList) => {
    setStats({
      total: ordersList.length,
      pending: ordersList.filter(o => o.status === "pending" || o.tracking?.currentStep === 0).length,
      inProgress: ordersList.filter(o => o.status === "preparing" || o.status === "out for delivery").length,
      completed: ordersList.filter(o => o.status === "completed").length
    });
  };

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      let ordersData = [];

      try {
        const response = await axios.get(`${API_BASE}/client/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          ordersData = response.data.orders;
        }
      } catch {}

      const localData = JSON.parse(localStorage.getItem("clientOrders")) || [];
      const merged = [...ordersData, ...localData];

      const formatted = merged.map(order => ({
        ...order,
        tracking: generateTrackingDetails(order),
        providerName: order.providerName || "Service Provider",
        amount: order.amount || "₹0"
      }));

      setOrders(formatted);
      calculateOrderStats(formatted);
      localStorage.setItem("clientOrders", JSON.stringify(formatted));

    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "order confirmed": return "#3b82f6";
      case "preparing order": return "#f59e0b";
      case "out for delivery": return "#6366f1";
      case "completed": return "#10b981";
      case "cancelled": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "order confirmed": return "✅";
      case "preparing order": return "📦";
      case "out for delivery": return "🚚";
      case "completed": return "🎉";
      case "cancelled": return "❌";
      default: return "⏳";
    }
  };

  const filteredOrders = orders.filter(order =>
    order.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="orders-container">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div className="orders-header">
          <h2>My Orders</h2>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </motion.div>

        {/* Order Stats */}
        <div className="orders-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* List */}
        <div className="orders-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Orders Found</h3>
              <p>You haven't placed any orders yet.</p>
              <button 
                className="browse-services-btn"
                onClick={() => navigate("/categories")}
              >
                Browse Services
              </button>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <OrderCard
                key={index}
                order={order}
                onTrack={() => setSelectedOrder(order)}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderTrackingModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          getStatusIcon={getStatusIcon}
        />
      )}
    </div>
  );
};

// ✅ Order Card (Chat button REMOVED)
const OrderCard = ({ order, onTrack, getStatusColor, getStatusIcon }) => {
  const tracking = order.tracking;
  const orderDate = new Date(order.bookingDate || order.date || new Date());

  return (
    <motion.div 
      className="order-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="order-header">
        <div className="order-title-section">
          <h3>{order.serviceType || "Service"}</h3>
          <span className="order-date">
            {orderDate.toLocaleDateString('en-IN', { 
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        <span className="order-status" style={{ backgroundColor: getStatusColor(tracking.currentStatus) }}>
          {getStatusIcon(tracking.currentStatus)} {tracking.currentStatus}
        </span>
      </div>

      <div className="order-details">
        <div className="detail-row">
          <span className="detail-label">Provider:</span>
          <span className="detail-value">{order.providerName}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Amount:</span>
          <span className="detail-value amount">{order.amount}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Order ID:</span>
          <span className="detail-value order-id">{order.id || order._id || "N/A"}</span>
        </div>
      </div>

      <div className="order-actions">
        <button onClick={onTrack} className="action-btn track">
          <span className="btn-icon">📍</span>
          Track Order
        </button>
      </div>
    </motion.div>
  );
};

// ✅ Tracking Modal
const OrderTrackingModal = ({ order, onClose, getStatusIcon }) => {
  const tracking = order.tracking;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Order Tracking</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="order-info-summary">
            <div className="summary-item">
              <span className="summary-label">Service:</span>
              <span className="summary-value">{order.serviceType}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Provider:</span>
              <span className="summary-value">{order.providerName}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Amount:</span>
              <span className="summary-value">{order.amount}</span>
            </div>
          </div>

          <div className="tracking-timeline">
            <h3 className="timeline-title">Order Status</h3>
            {tracking.statusHistory.map((step, i) => (
              <div key={i} className={`timeline-step ${i <= tracking.currentStep ? "completed" : ""}`}>
                <div className="timeline-marker">
                  <div className="marker-circle">
                    {getStatusIcon(step.status)}
                  </div>
                  {i < tracking.statusHistory.length - 1 && (
                    <div className="timeline-connector"></div>
                  )}
                </div>
                <div className="timeline-content">
                  <div className="step-header">
                    <strong>{step.status}</strong>
                    <span className="step-status">
                      {i === tracking.currentStep ? "Current" : i < tracking.currentStep ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <p className="step-description">{step.description}</p>
                  <span className="step-time">
                    {new Date(step.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-ok-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientOrdersPage;