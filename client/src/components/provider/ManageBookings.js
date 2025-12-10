import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProviderById } from "../../data";
import "./ManageBookings.css";

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  // -------------------------------
  // LOAD PROVIDER SESSION
  // -------------------------------
  useEffect(() => {
    const providerSession = localStorage.getItem("providerSession");
    const currentUser = localStorage.getItem("currentUser");

    if (!providerSession && !currentUser) {
      navigate("/login");
      return;
    }

    const sessionData = providerSession
      ? JSON.parse(providerSession)
      : JSON.parse(currentUser);

    const providerDetails = getProviderById(sessionData.id) || sessionData;
    setProvider(providerDetails);

    fetchBookings();
  }, [navigate]);

  // -------------------------------
  // FETCH BOOKINGS (CLEAN VERSION)
  // -------------------------------
  const fetchBookings = useCallback(() => {
    setLoading(true);

    try {
      const providerSession = JSON.parse(
        localStorage.getItem("providerSession") ||
          localStorage.getItem("currentUser") ||
          "{}"
      );

      const providerId = providerSession.id;
      const providerName = providerSession.name;
      const providerEmail = providerSession.email;

      const rawBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      const clientOrders = JSON.parse(localStorage.getItem("clientOrders") || "[]");

      const all = [...rawBookings, ...clientOrders];

      // Normalize data shape
      const normalized = all.map((b) => {
        const nb = { ...b };

        if (!nb.clientName && nb.customer) {
          nb.clientName = nb.customer.name;
          nb.clientEmail = nb.customer.email;
          nb.clientContact = nb.customer.phone;
          nb.clientAddress = nb.customer.address;
        }

        if (!nb.amount && nb.breakdown?.total) {
          nb.amount = `₹${nb.breakdown.total}`;
        }

        if (!nb.serviceType && nb.productName) {
          nb.serviceType = nb.productName;
        }

        return nb;
      });

      // Filter by provider ownership
      const myBookings = normalized.filter(
        (b) =>
          b.providerId === providerId ||
          b.providerName === providerName ||
          b.providerEmail === providerEmail
      );

      // Sort by latest
      myBookings.sort(
        (a, b) =>
          new Date(b.bookingDate || b.createdAt || 0) -
          new Date(a.bookingDate || a.createdAt || 0)
      );

      setBookings(myBookings);
    } catch (error) {
      console.error("Booking fetch error:", error);
      setBookings([]);
    }

    setLoading(false);
  }, []);

  // -------------------------------
  // FILTER BOOKINGS
  // -------------------------------
  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => {
          if (filter === "cancelled") {
            return b.status === "cancelled" || b.status === "rejected";
          }
          return b.status === filter;
        });

  // -------------------------------
  // UPDATE BOOKING STATUS
  // -------------------------------
  const updateBookingStatus = (bookingId, newStatus) => {
    const updatedList = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: newStatus } : b
    );

    setBookings(updatedList);

    // Update localStorage
    updateStorage("bookings", bookingId, newStatus);
    updateStorage("clientOrders", bookingId, newStatus);
  };

  const updateStorage = (key, id, status) => {
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = list.map((b) =>
      b.id === id ? { ...b, status } : b
    );
    localStorage.setItem(key, JSON.stringify(updated));
  };

  // -------------------------------
  // UI HELPERS
  // -------------------------------
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "accepted":
        return "#3b82f6";
      case "completed":
        return "#10b981";
      case "cancelled":
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (d) => {
    if (!d) return "Not specified";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (d) => {
    if (!d) return "Not specified";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // -------------------------------
  // RENDER UI
  // -------------------------------
  return (
    <div className="manage-bookings">

      {/* HEADER */}
      <div className="mb-header">
        <h1>📦 Manage Bookings</h1>
        <p>Welcome, {provider?.name}. Here are your recent service bookings.</p>
      </div>

      {/* FILTER TABS */}
      <div className="mb-filters">
        {["all", "pending", "accepted", "completed", "cancelled"].map((tab) => (
          <button
            key={tab}
            className={`mb-tab ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* BOOKING LIST */}
      <div className="mb-list">
        {loading ? (
          <p className="mb-loading">Loading bookings...</p>
        ) : filteredBookings.length === 0 ? (
          <p className="mb-empty">No bookings found.</p>
        ) : (
          filteredBookings.map((b) => (
            <div className="mb-card" key={b.id}>
              <div className="mb-card-header">
                <div>
                  <h3>Booking #{b.id}</h3>
                  <span className="mb-client">{b.clientName}</span>
                </div>

                <span
                  className="mb-status"
                  style={{ backgroundColor: getStatusColor(b.status) }}
                >
                  {b.status.toUpperCase()}
                </span>
              </div>

              <div className="mb-info-grid">
                <p><strong>Service:</strong> {b.serviceType}</p>
                <p><strong>Amount:</strong> {b.amount}</p>
                <p><strong>Booked On:</strong> {formatDateTime(b.bookingDate)}</p>
                <p><strong>Service Date:</strong> {formatDate(b.serviceDate)}</p>
                <p><strong>Contact:</strong> {b.clientContact}</p>
              </div>

              {b.clientAddress && (
                <p className="mb-address"><strong>Address:</strong> {b.clientAddress}</p>
              )}

              {/* ACTION BUTTONS */}
              <div className="mb-actions">
                {b.status === "pending" && (
                  <>
                    <button
                      className="mb-btn accept"
                      onClick={() => updateBookingStatus(b.id, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className="mb-btn reject"
                      onClick={() => updateBookingStatus(b.id, "cancelled")}
                    >
                      Reject
                    </button>
                  </>
                )}

                {b.status === "accepted" && (
                  <>
                    <button
                      className="mb-btn complete"
                      onClick={() => updateBookingStatus(b.id, "completed")}
                    >
                      Mark Completed
                    </button>
                    <button
                      className="mb-btn cancel"
                      onClick={() => updateBookingStatus(b.id, "cancelled")}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
