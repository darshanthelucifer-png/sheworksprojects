// src/components/admin/ManageUsers.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminManagement.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("joinDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToAction, setUserToAction] = useState(null);
  const [bulkAction, setBulkAction] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  const loadUsers = () => {
    try {
      const usersData = JSON.parse(localStorage.getItem("users")) || [];
      const orders = JSON.parse(localStorage.getItem("bookings")) || [];
      const clientOrders = JSON.parse(localStorage.getItem("clientOrders")) || [];
      const allOrders = [...orders, ...clientOrders];

      const formattedUsers = usersData.map(user => {
        const userOrders = allOrders.filter(order =>
          order.clientId === user.id || 
          order.customerId === user.id || 
          order.email === user.email
        );

        const completedOrders = userOrders.filter(order =>
          order.status === "completed" || order.status === "Delivered"
        ).length;

        const totalSpent = userOrders.reduce((sum, order) => {
          const amount = order.amount ? parseInt(order.amount.replace(/[^0-9]/g, "")) : order.price || 0;
          return sum + amount;
        }, 0);

        return {
          ...user,
          joinDate: user.joinDate || user.createdAt || new Date().toISOString(),
          status: user.status || "active",
          orders: userOrders.length,
          completedOrders,
          totalSpent,
          role: user.role || "client",
          location: user.location || "Not specified"
        };
      });

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    filtered.sort((a, b) => {
      const valA = sortBy === "joinDate" ? new Date(a.joinDate) : a[sortBy];
      const valB = sortBy === "joinDate" ? new Date(b.joinDate) : b[sortBy];
      return sortOrder === "desc" ? (valA < valB ? 1 : -1) : (valA > valB ? 1 : -1);
    });

    setFilteredUsers(filtered);
  };

  const handleSelectUser = (id) => {
    const updated = new Set(selectedUsers);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setSelectedUsers(updated);
  };

  const handleBlockUser = () => {
    const updated = users.map(u => u.id === userToAction.id ? { ...u, status: "blocked" } : u);
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
    setShowBlockModal(false);
  };

  const handleUnblockUser = (user) => {
    const updated = users.map(u => u.id === user.id ? { ...u, status: "active" } : u);
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  const handleDeleteUser = () => {
    const updated = users.filter(u => u.id !== userToAction.id);
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
    setShowDeleteModal(false);
  };

  if (loading) return <p className="loading">Loading users...</p>;

  const StatCard = ({ icon, title, value }) => (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  );

  return (
    <motion.div className="admin-management" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* ✅ CLEAN HEADER */}
      <div className="management-header">
        <div className="header-text">
          <h1>👥 User Management</h1>
          <p>Manage user accounts, status, and analytics</p>
        </div>
      </div>

      {/* ✅ STATS */}
      <div className="stats-overview">
        <StatCard icon="👥" title="Total Users" value={users.length} />
        <StatCard icon="✅" title="Active" value={users.filter(u => u.status === "active").length} />
        <StatCard icon="❌" title="Blocked" value={users.filter(u => u.status === "blocked").length} />
      </div>

      {/* ✅ TOOLBAR */}
      <div className="management-toolbar">
        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>

        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="client">Client</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* ✅ USER TABLE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th><th>Role</th><th>Status</th><th>Orders</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong><br/>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>{user.completedOrders || 0}</td>

                <td className="actions">
                  {user.status === "active" ? (
                    <button className="btn-block" onClick={() => { setUserToAction(user); setShowBlockModal(true); }}>🚫 Block</button>
                  ) : (
                    <button className="btn-unblock" onClick={() => handleUnblockUser(user)}>✅ Unblock</button>
                  )}

                  <button className="btn-delete" onClick={() => { setUserToAction(user); setShowDeleteModal(true); }}>🗑 Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ BLOCK MODAL */}
      <AnimatePresence>
        {showBlockModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Block {userToAction.name}?</h3>
              <p>This user will not be able to access their account.</p>
              <button className="btn-cancel" onClick={() => setShowBlockModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleBlockUser}>Block</button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ✅ DELETE MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Delete {userToAction.name}?</h3>
              <p>This action cannot be undone.</p>
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-confirm delete" onClick={handleDeleteUser}>Delete</button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default ManageUsers;
