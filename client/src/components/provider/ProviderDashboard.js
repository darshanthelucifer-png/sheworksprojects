// client/src/components/provider/ProviderDashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./ProviderDashboard.css";

import productsJson from "../../data/products.json";
import providersJson from "../../data/providers.json";
import manualProviders from "../../data/manualProviders";

/* ----------------- Constants & Helpers ----------------- */
const COMMISSION_RATE = 0.10;

const safeReplacePublic = (path) => {
  if (!path || typeof path !== "string") return null;
  return path.replace(/^public\//, "/");
};

const toINR = (n) => {
  const num = Number(n || 0);
  return "₹" + num.toLocaleString("en-IN", { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  });
};

const uid = (prefix = "p") => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

// Generate a unique filename for uploaded images
const generateImageName = (file) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = file.name.split('.').pop();
  return `product_${timestamp}_${random}.${extension}`;
};

/* ----------------- Sub Components ----------------- */
const LoadingState = () => (
  <div className="pd-loading">
    <div className="loading-spinner"></div>
    Loading your dashboard...
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="pd-no-session">
    <div className="error-icon">⚠️</div>
    <h3>Access Required</h3>
    <p>{message}</p>
    <div className="error-actions">
      <button className="btn primary" onClick={onRetry}>
        🔄 Try Again
      </button>
      <button className="btn" onClick={() => window.location.href = '/login'}>
        🔐 Go to Login
      </button>
    </div>
  </div>
);

const StatsGrid = ({ stats }) => (
  <section className="pd-stats">
    <div className="stat">
      <div className="stat-value">{stats.totalProducts}</div>
      <div className="stat-label">Total Products</div>
    </div>
    <div className="stat">
      <div className="stat-value">{stats.totalSales}</div>
      <div className="stat-label">Total Sales</div>
    </div>
    <div className="stat">
      <div className="stat-value">{toINR(stats.totalListedValue)}</div>
      <div className="stat-label">Listed Value</div>
    </div>
    <div className="stat">
      <div className="stat-value">{toINR(stats.totalEarnings)}</div>
      <div className="stat-label">Gross Earnings</div>
    </div>
    <div className="stat">
      <div className="stat-value">{toINR(stats.commission)}</div>
      <div className="stat-label">Commission ({COMMISSION_RATE * 100}%)</div>
    </div>
  </section>
);

const ProductCard = ({ product, onEdit, onDelete }) => (
  <div className="pd-card">
    <div className="pd-card-media">
      <img 
        src={product._displayImage} 
        alt={product.name}
        onError={(e) => {
          e.target.src = "/assets/default-product.png";
        }}
      />
    </div>
    <div className="pd-card-body">
      <h4 title={product.name}>{product.name}</h4>
      <div className="pd-cat">{product.category || product.serviceId}</div>
      {product.salesCount > 0 && (
        <div className="pd-sales">
          <span className="sales-badge">{product.salesCount} sold</span>
        </div>
      )}
      <div className="pd-bottom">
        <div className="pd-price">{toINR(product.price)}</div>
        <div className="pd-actions-inline">
          <button className="btn" onClick={() => onEdit(product)}>
            ✏️ Edit
          </button>
          <button className="btn danger" onClick={() => onDelete(product.id)}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ProductFormModal = ({ show, editing, form, onSubmit, onClose, onChange, onImageUpload }) => {
  if (!show) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="pd-modal-backdrop" onClick={onClose}>
      <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{editing ? "Edit Product" : "Add New Product"}</h3>
        <form onSubmit={onSubmit} className="pd-form">
          <label>
            Product Name *
            <input 
              name="name" 
              value={form.name} 
              onChange={onChange}
              placeholder="Enter product name"
              required 
            />
          </label>

          <label>
            Price (₹) *
            <input 
              name="price" 
              value={form.price} 
              onChange={onChange}
              type="number" 
              step="0.01" 
              min="0"
              placeholder="0.00"
              required 
            />
          </label>

          <label>
            Category
            <input 
              name="category" 
              value={form.category} 
              onChange={onChange}
              placeholder="e.g., Electronics, Fashion"
            />
          </label>

          <label>
            Service ID *
            <input 
              name="serviceId" 
              value={form.serviceId} 
              onChange={onChange}
              placeholder="Your service identifier"
              required 
            />
          </label>

          {/* Image Upload Section */}
          <label>
            Upload Product Image
            <input 
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{
                padding: '8px',
                border: '2px dashed #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb',
                width: '100%',
                marginTop: '6px'
              }}
            />
            <small style={{color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block'}}>
              Supported formats: JPG, PNG, WebP (Max 5MB)
            </small>
          </label>

          {/* Image Preview */}
          {form.imagePreview && (
            <div className="image-preview">
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Image Preview:</p>
              <img 
                src={form.imagePreview} 
                alt="Preview" 
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
            </div>
          )}

          {/* Current Image Path Display */}
          {form.imagePath && (
            <div style={{ 
              fontSize: '12px', 
              color: '#059669', 
              backgroundColor: '#f0fdf4',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #bbf7d0'
            }}>
              ✅ Image will be saved as: <strong>{form.imagePath}</strong>
            </div>
          )}

          <div className="pd-form-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              {editing ? "💾 Save Changes" : "➕ Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ----------------- Main Component ----------------- */
export default function ProviderDashboard() {
  const [provider, setProvider] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    imagePath: "",
    imagePreview: "",
    category: "",
    serviceId: ""
  });

  /* ----------------- Memoized Values ----------------- */
  const stats = useMemo(() => {
    const totals = products.reduce((acc, p) => {
      const price = Number(p.price || 0);
      const sales = Number(p.salesCount || 0);
      
      acc.totalProducts += 1;
      acc.totalListedValue += price;
      acc.totalSales += sales;
      acc.totalEarnings += price * sales;
      
      return acc;
    }, { 
      totalProducts: 0, 
      totalListedValue: 0, 
      totalSales: 0, 
      totalEarnings: 0 
    });

    return {
      ...totals,
      commission: totals.totalEarnings * COMMISSION_RATE
    };
  }, [products]);

  const profileImg = useMemo(() => {
    if (!provider) return "/assets/default-profile.png";
    return provider.providerData?.image || 
           safeReplacePublic(provider.providerData?.imagePath) || 
           provider.image || 
           "/assets/default-profile.png";
  }, [provider]);

  /* ----------------- Image Upload Handler ----------------- */
  const handleImageUpload = useCallback((file) => {
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const imageDataUrl = event.target.result;
      const imagePath = `/assets/products/${generateImageName(file)}`;
      
      setForm(prev => ({
        ...prev,
        imagePreview: imageDataUrl,
        imagePath: imagePath,
        imageBase64: imageDataUrl // Store base64 for localStorage
      }));
    };

    reader.onerror = () => {
      alert('Error reading image file. Please try again.');
    };

    reader.readAsDataURL(file);
  }, []);

  /* ----------------- Data Initialization ----------------- */
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check multiple session sources for provider data
      const provSession = JSON.parse(localStorage.getItem("providerSession") || "null");
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      const userRole = localStorage.getItem("role") || localStorage.getItem("userRole");
      
      let providerData = null;

      // If no direct provider session but user is logged in as provider
      if (!provSession && currentUser && userRole === "provider") {
        // Check registered providers
        const registeredProviders = JSON.parse(localStorage.getItem("registeredProviders") || "[]");
        const foundRegisteredProvider = registeredProviders.find(p => 
          p.email === currentUser.email
        );
        
        if (foundRegisteredProvider) {
          // Create provider session from registered provider
          localStorage.setItem("providerSession", JSON.stringify(foundRegisteredProvider));
          providerData = foundRegisteredProvider;
        } else {
          setError("No provider profile found. Please complete your provider registration.");
          setLoading(false);
          return;
        }
      } else if (provSession) {
        providerData = { ...provSession };
      } else {
        setError("No active provider session found. Please log in as a provider.");
        setLoading(false);
        return;
      }

      // Enhance provider data from multiple sources
      if (providerData) {
        const manual = Array.isArray(manualProviders) ? manualProviders : [];
        const providersArr = providersJson.providers || providersJson || [];
        const registeredProviders = JSON.parse(localStorage.getItem("registeredProviders") || "[]");

        // Check in manual providers first
        const foundManualProvider = manual.find(p => 
          (p.email && providerData.email && p.email.toLowerCase() === providerData.email.toLowerCase()) ||
          (p.id && providerData.id && String(p.id) === String(providerData.id))
        );

        // Then check in registered providers
        const foundRegisteredProvider = registeredProviders.find(p => 
          (p.email && providerData.email && p.email.toLowerCase() === providerData.email.toLowerCase()) ||
          (p.id && providerData.id && String(p.id) === String(providerData.id))
        );

        // Then check in JSON providers
        const foundJsonProvider = providersArr.find(p =>
          (p.serviceId && providerData.serviceId && p.serviceId === providerData.serviceId) ||
          (p.id && providerData.id && String(p.id) === String(providerData.id)) ||
          (p.name && providerData.name && p.name === providerData.name)
        );

        // Merge provider data (priority: manual > registered > json)
        if (foundManualProvider) {
          providerData.providerData = { ...(providerData.providerData || {}), ...foundManualProvider };
        } else if (foundRegisteredProvider) {
          providerData.providerData = { ...(providerData.providerData || {}), ...foundRegisteredProvider };
        } else if (foundJsonProvider) {
          providerData.providerData = { ...(providerData.providerData || {}), ...foundJsonProvider };
        }

        setProvider(providerData);
      }

      // Get serviceId from the provider data - with multiple fallbacks
      const serviceId = providerData?.providerData?.serviceId || 
                       providerData?.serviceId || 
                       providerData?.providerData?.category?.toLowerCase().replace(/\s+/g, '_') ||
                       providerData?.category?.toLowerCase().replace(/\s+/g, '_') ||
                       providerData?.name?.toLowerCase().replace(/\s+/g, '_');
      
      if (!serviceId) {
        setError("No service ID found for provider. Please complete your provider profile.");
        setLoading(false);
        return;
      }

      // Load products
      let providerProducts = [];

      try {
        // Try localStorage first
        const storedProvProducts = JSON.parse(localStorage.getItem("providerProducts") || "[]");
        const storedGlobal = JSON.parse(localStorage.getItem("products") || "[]");
        
        if (storedProvProducts.length > 0) {
          // Filter by serviceId
          providerProducts = storedProvProducts.filter(p => 
            (p.serviceId || "").trim() === serviceId.trim()
          );
        } else if (storedGlobal.length > 0) {
          // Filter by serviceId
          providerProducts = storedGlobal.filter(p => 
            (p.serviceId || "").trim() === serviceId.trim()
          );
        } else {
          // Fallback to JSON file
          const imported = productsJson.products || productsJson || [];
          localStorage.setItem("products", JSON.stringify(imported));
          // Filter by serviceId
          providerProducts = imported.filter(p => 
            (p.serviceId || "").trim() === serviceId.trim()
          );
          localStorage.setItem("providerProducts", JSON.stringify(providerProducts));
        }
      } catch (err) {
        console.error("Products load error:", err);
        setError("Failed to load products data.");
      }

      // Normalize product images - handle both URL paths and base64 images
      const normalizedProducts = providerProducts.map(p => ({
        ...p,
        _displayImage: p.imageBase64 || safeReplacePublic(p.imagePath || p.image) || "/assets/default-product.png"
      }));

      setProducts(normalizedProducts);
    } catch (e) {
      console.error("Initialization error:", e);
      setError("Failed to initialize dashboard. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  /* ----------------- CRUD Operations ----------------- */
  const openAddForm = useCallback(() => {
    setEditing(null);
    setForm({
      name: "",
      price: "",
      imagePath: "",
      imagePreview: "",
      imageBase64: "",
      category: "",
      // Use correct serviceId from providerData
      serviceId: provider?.providerData?.serviceId || provider?.serviceId || ""
    });
    setShowForm(true);
  }, [provider]);

  const openEditForm = useCallback((product) => {
    setEditing(product);
    setForm({
      name: product.name || "",
      price: product.price || "",
      imagePath: product.imagePath || product.image || "",
      imagePreview: product.imageBase64 || product._displayImage || "",
      imageBase64: product.imageBase64 || "",
      category: product.category || "",
      // Use correct serviceId from providerData
      serviceId: product.serviceId || provider?.providerData?.serviceId || provider?.serviceId || ""
    });
    setShowForm(true);
  }, [provider]);

  const onFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const saveForm = useCallback((e) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.price || !form.serviceId.trim()) {
      alert("Please fill in all required fields (Name, Price, Service ID)");
      return;
    }

    const newProduct = {
      id: editing ? editing.id : uid("p"),
      name: form.name.trim(),
      price: Number(form.price || 0),
      imagePath: form.imagePath.trim() || undefined,
      image: form.imagePath.trim() ? safeReplacePublic(form.imagePath.trim()) : undefined,
      imageBase64: form.imageBase64 || undefined, // Store base64 image data
      category: form.category.trim() || (form.serviceId || provider?.providerData?.serviceId || provider?.serviceId || ""),
      // Use correct serviceId from providerData
      serviceId: form.serviceId.trim() || provider?.providerData?.serviceId || provider?.serviceId || "",
      salesCount: editing ? (editing.salesCount || 0) : 0,
      createdAt: editing ? (editing.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Update provider products
      const provList = JSON.parse(localStorage.getItem("providerProducts") || "[]");
      let newProvList;
      
      if (editing) {
        newProvList = provList.map(p => 
          String(p.id) === String(editing.id) ? newProduct : p
        );
      } else {
        newProvList = [...provList, newProduct];
      }
      localStorage.setItem("providerProducts", JSON.stringify(newProvList));

      // Update global products
      const global = JSON.parse(localStorage.getItem("products") || "[]");
      let newGlobal;
      
      if (editing) {
        newGlobal = global.map(p => 
          String(p.id) === String(editing.id) ? { ...p, ...newProduct } : p
        );
      } else {
        newGlobal = [...global, newProduct];
      }
      localStorage.setItem("products", JSON.stringify(newGlobal));

      // Use correct serviceId for filtering
      const currentServiceId = provider?.providerData?.serviceId || provider?.serviceId;
      const filtered = newProvList.filter(p => 
        (p.serviceId || "").trim() === currentServiceId.trim()
      );
      
      const normalized = filtered.map(p => ({
        ...p,
        _displayImage: p.imageBase64 || safeReplacePublic(p.imagePath || p.image) || "/assets/default-product.png"
      }));

      setProducts(normalized);
      setShowForm(false);
      setEditing(null);
      
      // Show success feedback
      if (editing) {
        alert("Product updated successfully!");
      } else {
        alert("Product added successfully!");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save product. Please try again.");
    }
  }, [form, editing, provider]);

  const handleDeleteProduct = useCallback((id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      const provList = JSON.parse(localStorage.getItem("providerProducts") || "[]")
        .filter(p => String(p.id) !== String(id));
      localStorage.setItem("providerProducts", JSON.stringify(provList));

      const global = JSON.parse(localStorage.getItem("products") || "[]")
        .filter(p => String(p.id) !== String(id));
      localStorage.setItem("products", JSON.stringify(global));

      // Use correct serviceId for filtering
      const currentServiceId = provider?.providerData?.serviceId || provider?.serviceId;
      const filtered = provList.filter(p => 
        (p.serviceId || "").trim() === currentServiceId.trim()
      );
      
      const normalized = filtered.map(p => ({
        ...p,
        _displayImage: p.imageBase64 || safeReplacePublic(p.imagePath || p.image) || "/assets/default-product.png"
      }));

      setProducts(normalized);
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product. Please try again.");
    }
  }, [provider]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditing(null);
  }, []);

  /* ----------------- Render Logic ----------------- */
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={initialize} />;
  if (!provider) return <ErrorState message="No provider session found. Please login as provider." onRetry={initialize} />;

  return (
    <div className="provider-dashboard">
      {/* Header */}
      <header className="pd-header">
        <div className="pd-left">
          <img 
            className="pd-avatar" 
            src={profileImg} 
            alt={provider.name}
            onError={(e) => {
              e.target.src = "/assets/default-profile.png";
            }} 
          />
          <div className="pd-info">
            <h2>{provider.name}</h2>
            <div className="pd-meta">
              {provider.providerData?.phone && (
                <span>📞 {provider.providerData.phone}</span>
              )}
              {provider.providerData?.location && (
                <span>📍 {provider.providerData.location}</span>
              )}
              <span className="pd-service">
                {(provider.providerData?.serviceId || provider.serviceId || "Unknown Service")
                  .replace(/_/g, " ")}
              </span>
              {provider.providerType === "registered" && (
                <span className="pd-badge">New Provider</span>
              )}
            </div>
          </div>
        </div>

        <div className="pd-actions">
          <button className="btn primary" onClick={openAddForm}>
            ➕ Add Product
          </button>
        </div>
      </header>

      {/* Statistics */}
      <StatsGrid stats={stats} />

      {/* Products Grid */}
      <section className="pd-products">
        <div className="pd-products-header">
          <h3>Your Products ({products.length})</h3>
        </div>

        {products.length === 0 ? (
          <div className="pd-empty">
            <h3>No Products Yet</h3>
            <p>Start by adding your first product to showcase your services</p>
            <button className="btn primary" onClick={openAddForm}>
              ➕ Add Your First Product
            </button>
          </div>
        ) : (
          <div className="pd-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={openEditForm}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* Product Form Modal */}
      <ProductFormModal
        show={showForm}
        editing={editing}
        form={form}
        onSubmit={saveForm}
        onClose={closeForm}
        onChange={onFormChange}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}