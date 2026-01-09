import React, { useState, useEffect } from "react";
import "./AdminSettings.css";

const AdminSettings = () => {
  const [commission, setCommission] = useState(10);
  const [cancelFee, setCancelFee] = useState(5);
  const [autoApprove, setAutoApprove] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("adminSettings")) || {};
    setCommission(saved.commission ?? 10);
    setCancelFee(saved.cancelFee ?? 5);
    setAutoApprove(saved.autoApprove ?? true);
    setMaintenance(saved.maintenance ?? false);
    setCategories(
      saved.categories || [
        "Hand Embroidery",
        "Food",
        "Beauty",
        "Events",
        "Crafts",
      ]
    );
  }, []);

  const saveSettings = () => {
    const settings = {
      commission,
      cancelFee,
      autoApprove,
      maintenance,
      categories,
    };
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    alert("✅ Settings saved successfully!");
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setCategories([...categories, newCategory.trim()]);
    setNewCategory("");
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-settings-container">
      {/* HEADER */}
      <div className="admin-settings-header">
        <h1>⚙️ Admin Settings</h1>
        <p>Manage platform configuration & controls</p>
      </div>

      {/* COMMISSION */}
      <div className="settings-card">
        <h3>💰 Commission Settings</h3>
        <p className="hint">Platform commission percentage</p>
        <input
          type="number"
          value={commission}
          onChange={(e) => setCommission(Number(e.target.value))}
        />
      </div>

      {/* CANCELLATION */}
      <div className="settings-card">
        <h3>❌ Order Cancellation Policy</h3>
        <p className="hint">Cancellation fee applied to orders</p>
        <input
          type="number"
          value={cancelFee}
          onChange={(e) => setCancelFee(Number(e.target.value))}
        />
      </div>

      {/* PROVIDER APPROVAL */}
      <div className="settings-card toggle-card">
        <div>
          <h3>🧾 Provider Approval</h3>
          <p className="hint">Automatically approve new providers</p>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={() => setAutoApprove(!autoApprove)}
          />
          <span className="slider"></span>
        </label>
      </div>

      {/* MAINTENANCE */}
      <div className="settings-card toggle-card danger">
        <div>
          <h3>🛑 Maintenance Mode</h3>
          <p className="hint">Temporarily disable the platform</p>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={maintenance}
            onChange={() => setMaintenance(!maintenance)}
          />
          <span className="slider"></span>
        </label>
      </div>

      {/* CATEGORIES */}
      <div className="settings-card">
        <h3>📂 Service Categories</h3>

        <div className="category-grid">
          {categories.map((cat, index) => (
            <div className="category-pill" key={index}>
              {cat}
              <button onClick={() => removeCategory(index)}>✖</button>
            </div>
          ))}
        </div>

        <div className="add-category-row">
          <input
            type="text"
            placeholder="Add new category..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="secondary-btn" onClick={addCategory}>
            Add
          </button>
        </div>
      </div>

      {/* SAVE */}
      <div className="settings-footer">
        <button className="primary-btn" onClick={saveSettings}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
