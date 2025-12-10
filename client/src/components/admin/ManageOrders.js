import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { manualProviders } from "../../data";
import "./ManageOrders.css";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, activeTab, sortBy, sortOrder]);

  const loadOrders = () => {
    try {
      setLoading(true);
      const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
      const clientOrders = JSON.parse(localStorage.getItem("clientOrders")) || [];

      const allOrders = [...bookings, ...clientOrders];
      const uniqueOrders = allOrders.filter((order, index, self) =>
        index === self.findIndex((o) => o.id === order.id)
      );

      const enhancedOrders = uniqueOrders.map(order => {
        const provider = manualProviders.find(p => p.id === order.providerId);
        return {
          ...order,
          providerName: provider?.name || order.providerName || "Unknown Provider",
          providerCategory: provider?.category || order.providerCategory || "General",
          providerRating: provider?.rating || 4.0,
          quickBuyId: `QB-${order.id?.slice(-6).toUpperCase()}`,
        };
      });

      setOrders(enhancedOrders);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    if (activeTab !== "all") {
      filtered = filtered.filter(order => getOrderStatus(order).toLowerCase() === activeTab);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(order =>
        order.quickBuyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.serviceType || order.service || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order =>
        getOrderStatus(order).toLowerCase() === statusFilter.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "amount") {
        return (b.amount || 0) - (a.amount || 0);
      }
      return 0;
    });

    setFilteredOrders(filtered);
  };

  const getOrderStatus = (order) =>
    order.tracking?.currentStatus || order.status || "pending";

  const updateOrderStatus = (order, newStatus) => {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const clientOrders = JSON.parse(localStorage.getItem("clientOrders")) || [];

    const update = (list) =>
      list.map(o =>
        o.id === order.id
          ? { ...o, tracking: { ...o.tracking, currentStatus: newStatus } }
          : o
      );

    localStorage.setItem("bookings", JSON.stringify(update(bookings)));
    localStorage.setItem("clientOrders", JSON.stringify(update(clientOrders)));

    loadOrders();
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <motion.div className="admin-management" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* HEADER */}
      <div className="management-header no-back">
        <h1>📦 Manage Orders</h1>
        <p>Track and manage orders efficiently</p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="management-toolbar">
        <input
          type="text"
          placeholder="Search by QuickBuy ID, Provider, or Service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ORDERS TABLE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>QuickBuy ID</th>
              <th>Provider</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td><strong>{order.quickBuyId}</strong></td>
                <td>{order.providerName}</td>
                <td>{order.service || order.serviceType}</td>
                <td>₹{order.amount || 0}</td>

                <td>
                  <span className={`status-badge status-${getOrderStatus(order).toLowerCase()}`}>
                    {getOrderStatus(order)}
                  </span>
                </td>

                <td>
                  <select
                    className="status-dropdown"
                    value={getOrderStatus(order)}
                    onChange={(e) => updateOrderStatus(order, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ManageOrders;
