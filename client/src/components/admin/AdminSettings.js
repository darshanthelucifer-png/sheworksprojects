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
    const savedSettings = JSON.parse(localStorage.getItem("adminSettings")) || {};
    setCommission(savedSettings.commission || 10);
    setCancelFee(savedSettings.cancelFee || 5);
    setAutoApprove(savedSettings.autoApprove ?? true);
    setMaintenance(savedSettings.maintenance ?? false);
    setCategories(savedSettings.categories || ["Hand Embroidery", "Food", "Beauty", "Events", "Crafts"]);
  }, []);

  const saveSettings = () => {
    const settings = { commission, cancelFee, autoApprove, maintenance, categories };
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    alert("✅ Settings saved successfully!");
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setCategories([...categories, newCategory.trim()]);
    setNewCategory("");
  };

  const removeCategory = (index) => {
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };

  return (
    <div className="admin-settings">
      <h1>⚙️ Admin Settings</h1>
      <p className="sub">Manage platform configuration & controls</p>

      <div className="settings-section">
        <h3>💰 Commission Settings</h3>
        <div className="input-row">
          <label>Platform Commission (%)</label>
          <input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} />
        </div>
      </div>

      <div className="settings-section">
        <h3>❌ Order Cancellation Policy</h3>
        <div className="input-row">
          <label>Cancellation Fee (%)</label>
          <input type="number" value={cancelFee} onChange={(e) => setCancelFee(e.target.value)} />
        </div>
      </div>

      <div className="settings-section">
        <h3>🧾 Provider Approval</h3>
        <label className="toggle">
          <input type="checkbox" checked={autoApprove} onChange={() => setAutoApprove(!autoApprove)} />
          <span></span>
          Auto Approve Providers
        </label>
      </div>

      <div className="settings-section">
        <h3>🛑 Maintenance Mode</h3>
        <label className="toggle danger">
          <input type="checkbox" checked={maintenance} onChange={() => setMaintenance(!maintenance)} />
          <span></span>
          Enable Maintenance (shutdown platform temporarily)
        </label>
      </div>

      <div className="settings-section">
        <h3>📂 Service Categories</h3>
        <div className="category-list">
          {categories.map((cat, index) => (
            <div className="category-item" key={index}>
              <span>{cat}</span>
              <button className="remove-btn" onClick={() => removeCategory(index)}>✖</button>
            </div>
          ))}
        </div>

        <div className="add-category">
          <input
            type="text"
            placeholder="Add new category..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="add-btn" onClick={addCategory}>Add</button>
        </div>
      </div>

      <button className="save-btn" onClick={saveSettings}>💾 Save Settings</button>
    </div>
  );
};

export default AdminSettings;
