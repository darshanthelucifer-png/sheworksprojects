import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminAnalytics.css";

// Formatters
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    amount
  );
const formatNumber = (num) => new Intl.NumberFormat("en-IN").format(num);

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    popularServices: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState("overview");

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    setLoading(true);

    // ✅ Load real orders data from localStorage
    const bookings =
      JSON.parse(localStorage.getItem("bookings")) ||
      JSON.parse(localStorage.getItem("clientOrders")) ||
      [];

    // Group revenue by service
    const revenueMap = {};
    bookings.forEach((order) => {
      const service = order.serviceType || order.service || "Other Service";
      const amount =
        parseInt(String(order.amount || order.price).replace(/[^0-9]/g, "")) ||
        0;
      revenueMap[service] = (revenueMap[service] || 0) + amount;
    });

    const popularServices = Object.keys(revenueMap).map((service) => ({
      service,
      revenue: revenueMap[service],
    }));

    // Sort descending
    popularServices.sort((a, b) => b.revenue - a.revenue);

    setAnalyticsData({ popularServices });
    setLoading(false);
  };

  const totalRevenue = analyticsData.popularServices.reduce(
    (sum, s) => sum + s.revenue,
    0
  );

  const exportData = () => {
    const rows = [
      ["Service", "Revenue"],
      ...analyticsData.popularServices.map((s) => [s.service, s.revenue]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "service_revenue_report.csv";
    a.click();
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">

      {/* Page Title */}
      <div className="analytics-title">
        <h1>📊 Analytics Dashboard</h1>
        <p>Real-time performance & revenue overview</p>
      </div>

      {/* Metric Tabs */}
      <div className="metric-tabs">
        {["overview", "services"].map((tab) => (
          <button
            key={tab}
            className={activeMetric === tab ? "active" : ""}
            onClick={() => setActiveMetric(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeMetric === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="overview-grid"
          >
            <div className="metric-card">
              <h3>Total Revenue</h3>
              <p className="metric-value">{formatCurrency(totalRevenue)}</p>
            </div>

            <div className="metric-card">
              <h3>Total Services</h3>
              <p className="metric-value">{analyticsData.popularServices.length}</p>
            </div>
          </motion.div>
        )}

        {activeMetric === "services" && (
          <motion.div
            key="services"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="service-analytics"
          >
            <div className="card-header">
              <h2>🎯 Service Revenue Distribution</h2>
              <button className="export-btn" onClick={exportData}>
                📥 Export CSV
              </button>
            </div>

            {/* ✅ Pure CSS Donut Chart */}
            <div className="chart-wrapper">
              <div
                className="donut-chart"
                style={{
                  background: `conic-gradient(${analyticsData.popularServices
                    .map(
                      (s, i) =>
                        `var(--c${(i % 5) + 1}) ${
                          (analyticsData.popularServices
                            .slice(0, i)
                            .reduce((sum, x) => sum + x.revenue, 0) /
                            totalRevenue) *
                            360
                        }deg ${(analyticsData.popularServices
                          .slice(0, i + 1)
                          .reduce((sum, x) => sum + x.revenue, 0) /
                          totalRevenue) *
                          360}deg`
                    )
                    .join(", ")})`,
                }}
              ></div>

              <div className="legend">
                {analyticsData.popularServices.map((s, i) => (
                  <p key={i}>
                    <span className={`legend-box color-${(i % 5) + 1}`}></span>
                    {s.service} — <strong>{formatCurrency(s.revenue)}</strong>
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAnalytics;
