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
          <h2>📦 My Orders</h2>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </motion.div>

        {/* List */}
        <div className="orders-list">
          {loading ? (
            <p className="loading-state">Loading...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="empty-state">No orders found</p>
          ) : (
            filteredOrders.map((order, index) => (
              <OrderCard
                key={index}
                order={order}
                onChat={() => navigate(`/client/chat/${order.providerId}`)}
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

// ✅ Order Card (View Provider REMOVED)
const OrderCard = ({ order, onChat, onTrack, getStatusColor, getStatusIcon }) => {
  const tracking = order.tracking;

  return (
    <motion.div className="order-card">
      <div className="order-header">
        <h3>{order.serviceType}</h3>
        <span className="order-status" style={{ backgroundColor: getStatusColor(tracking.currentStatus) }}>
          {getStatusIcon(tracking.currentStatus)} {tracking.currentStatus}
        </span>
      </div>

      <div className="order-details">
        <strong>Provider:</strong> {order.providerName}
        <br />
        <strong>Amount:</strong> {order.amount}
      </div>

      <div className="order-actions">
        <button onClick={onTrack} className="action-btn track">📍 Track</button>
        <button onClick={onChat} className="action-btn chat">💬 Chat</button>
      </div>
    </motion.div>
  );
};

// ✅ Tracking Modal
const OrderTrackingModal = ({ order, onClose, getStatusIcon }) => {
  const tracking = order.tracking;

  return (
    <div className="modal-overlay">
      <motion.div className="modal-content">
        <div className="modal-header">
          <h2>Tracking - {order.serviceType}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {tracking.statusHistory.map((step, i) => (
          <div key={i} className={`timeline-step ${i <= tracking.currentStep ? "completed" : ""}`}>
            <div className="timeline-marker">{getStatusIcon(step.status)}</div>
            <div className="timeline-content">
              <strong>{step.status}</strong>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ClientOrdersPage;
