// src/components/admin/AdminReports.js
import React from "react";
import "./AdminReports.css"; // ← NEW CSS FILE

const AdminReports = () => {
  return (
    <div className="admin-reports-page fade-in">

      {/* Header */}
      <div className="reports-header">
        <h1>📊 Reports & Analytics</h1>
        <p>View insights, trends, and platform performance</p>
      </div>

      {/* Cards Section */}
      <div className="reports-grid">

        <div className="report-card">
          <div className="report-icon">💰</div>
          <h3>Revenue Report</h3>
          <p>Analyze total earnings & growth</p>
          <button className="report-btn">View Report</button>
        </div>

        <div className="report-card">
          <div className="report-icon">🧾</div>
          <h3>Orders Report</h3>
          <p>Track completed & pending orders</p>
          <button className="report-btn">View Report</button>
        </div>

        <div className="report-card">
          <div className="report-icon">👥</div>
          <h3>User Activity</h3>
          <p>Monitor signups & user behavior</p>
          <button className="report-btn">View Report</button>
        </div>

        <div className="report-card">
          <div className="report-icon">🏪</div>
          <h3>Provider Performance</h3>
          <p>Check ratings & work completed</p>
          <button className="report-btn">View Report</button>
        </div>

      </div>

      {/* Coming Soon Area */}
      <div className="coming-soon-box">
        <h2>📅 Advanced reports coming soon...</h2>
        <p>Charts • Trends • Export options • Date filters</p>
      </div>

    </div>
  );
};

export default AdminReports;
