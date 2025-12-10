// src/components/client/QuickBuyPage.js - INTEGRATED WITH PDF BILL GENERATOR
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import "./QuickBuyPage.css";

const QuickBuyPage = () => {
  const { providerId, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [provider, setProvider] = useState(null);
  const [generatedBill, setGeneratedBill] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    serviceType: "",
    description: "",
    serviceDate: "",
    serviceTime: "",
    quantity: 1,
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    specialInstructions: "",
    contactPreference: "phone",
    urgency: "normal"
  });

  useEffect(() => {
    const { product, provider: locationProvider } = location.state || {};
    
    if (product) {
      setSelectedProduct(product);
      setFormData(prev => ({
        ...prev,
        serviceType: product.name,
        description: product.description || ""
      }));
    }
    
    if (locationProvider) {
      setProvider(locationProvider);
    } else {
      const storedProvider = JSON.parse(localStorage.getItem(`provider_${providerId}`));
      if (storedProvider) setProvider(storedProvider);
    }

    // FIXED: Changed from "user" to "currentUser"
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setFormData(prev => ({
      ...prev,
      fullName: user.name || "",
      email: user.email || "",
      phone: user.phone || ""
    }));
  }, [providerId, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (change) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + change)
    }));
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) {
          alert("Please enter your full name");
          return false;
        }
        if (!formData.phone.trim() || formData.phone.length < 10) {
          alert("Please enter a valid phone number");
          return false;
        }
        if (!formData.address.trim()) {
          alert("Please enter your address");
          return false;
        }
        return true;

      case 2:
        if (!formData.serviceDate) {
          alert("Please select a service date");
          return false;
        }
        return true;

      case 3:
        if (formData.paymentMethod === "card") {
          if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
            alert("Please enter a valid 16-digit card number");
            return false;
          }
          if (!formData.cardholderName.trim()) {
            alert("Please enter cardholder name");
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const calculateBreakdown = () => {
    if (!selectedProduct) return {};
    
    const basePrice = selectedProduct.price || 0;
    const subtotal = basePrice * formData.quantity;
    let urgencyFee = 0;
    
    switch (formData.urgency) {
      case "high":
        urgencyFee = basePrice * 0.2;
        break;
      case "urgent":
        urgencyFee = basePrice * 0.5;
        break;
      default:
        break;
    }
    
    const tax = (subtotal + urgencyFee) * 0.18; // 18% GST
    const total = subtotal + urgencyFee + tax;
    
    return {
      subtotal: Math.round(subtotal),
      urgencyFee: Math.round(urgencyFee),
      tax: Math.round(tax),
      total: Math.round(total)
    };
  };

  // PDF Bill Generator
  const generateBillPDF = (booking) => {
    const breakdown = calculateBreakdown();
    
    const doc = new jsPDF();
    
    // Add logo/header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SHEWORKS', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Service Booking Invoice', 105, 22, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Invoice details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${booking.id}`, 15, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 50);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 15, 55);
    
    // Provider details (right side)
    doc.text('Service Provider:', 150, 45);
    doc.text(provider?.name || 'Service Provider', 150, 50);
    doc.text(`Provider ID: ${providerId}`, 150, 55);
    
    // Customer details
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 15, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.fullName, 15, 75);
    doc.text(formData.phone, 15, 80);
    doc.text(formData.email, 15, 85);
    doc.text(formData.address, 15, 90);
    doc.text(`${formData.city} - ${formData.pincode}`, 15, 95);
    
    // Service details
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE DETAILS:', 15, 110);
    doc.setFont('helvetica', 'normal');
    doc.text(`Service: ${formData.serviceType}`, 15, 115);
    doc.text(`Service Date: ${formData.serviceDate}`, 15, 120);
    doc.text(`Service Time: ${formData.serviceTime || 'Flexible'}`, 15, 125);
    doc.text(`Quantity: ${formData.quantity}`, 15, 130);
    doc.text(`Urgency: ${formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)}`, 15, 135);
    
    if (formData.specialInstructions) {
      doc.text(`Special Instructions: ${formData.specialInstructions}`, 15, 140);
    }
    
    // Bill breakdown table
    doc.setFont('helvetica', 'bold');
    doc.text('BILL BREAKDOWN', 15, 155);
    
    // Table headers
    doc.setFillColor(243, 244, 246);
    doc.rect(15, 160, 180, 10, 'F');
    doc.text('Description', 20, 166);
    doc.text('Amount (₹)', 170, 166, { align: 'right' });
    
    // Table rows
    let yPos = 175;
    
    // Base amount
    doc.setFont('helvetica', 'normal');
    doc.text(`Service Fee (${formData.quantity} x ₹${selectedProduct.price})`, 20, yPos);
    doc.text(`₹${breakdown.subtotal}`, 170, yPos, { align: 'right' });
    yPos += 8;
    
    // Urgency fee if applicable
    if (breakdown.urgencyFee > 0) {
      doc.text(`Urgency Fee (${formData.urgency})`, 20, yPos);
      doc.text(`₹${breakdown.urgencyFee}`, 170, yPos, { align: 'right' });
      yPos += 8;
    }
    
    // Tax
    doc.text('GST (18%)', 20, yPos);
    doc.text(`₹${breakdown.tax}`, 170, yPos, { align: 'right' });
    yPos += 8;
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(229, 231, 235);
    doc.rect(15, yPos, 180, 10, 'F');
    doc.text('TOTAL AMOUNT', 20, yPos + 6);
    doc.text(`₹${breakdown.total}`, 170, yPos + 6, { align: 'right' });
    yPos += 15;
    
    // Payment method
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`, 15, yPos);
    yPos += 8;
    
    if (formData.paymentMethod === 'card') {
      doc.text(`Card: **** **** **** ${formData.cardNumber.slice(-4)}`, 15, yPos);
    }
    
    // Terms and conditions
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    yPos += 8;
    doc.text('1. Payment must be made as per the chosen payment method.', 15, yPos);
    yPos += 5;
    doc.text('2. Cancellation policy: 24 hours notice required for full refund.', 15, yPos);
    yPos += 5;
    doc.text('3. Service provider will contact you before the service date.', 15, yPos);
    yPos += 5;
    doc.text('4. For queries, contact support@sheworks.com', 15, yPos);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing SheWorks!', 105, 280, { align: 'center' });
    doc.text('We appreciate your business.', 105, 285, { align: 'center' });
    
    return doc;
  };

  const downloadBill = (booking) => {
    const doc = generateBillPDF(booking);
    doc.save(`SheWorks-Bill-${booking.id}.pdf`);
  };

  const previewBill = (booking) => {
    const doc = generateBillPDF(booking);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setGeneratedBill(pdfUrl);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) return;

    setLoading(true);

    try {
      const breakdown = calculateBreakdown();
      
      const booking = {
        id: `quickbuy_${Date.now()}`,
        providerId,
        productId,
        providerName: provider?.name || "Service Provider",
        productName: selectedProduct?.name || "Service",
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode
        },
        serviceType: formData.serviceType,
        description: formData.description,
        serviceDate: formData.serviceDate,
        serviceTime: formData.serviceTime,
        quantity: formData.quantity,
        paymentMethod: formData.paymentMethod,
        amount: breakdown.total,
        currency: "₹",
        breakdown: breakdown,
        specialInstructions: formData.specialInstructions,
        contactPreference: formData.contactPreference,
        urgency: formData.urgency,
        status: formData.paymentMethod === "cod" ? "pending" : "confirmed",
        bookingDate: new Date().toISOString(),
        tracking: {
          currentStatus: formData.paymentMethod === "cod" ? "Pending Confirmation" : "Order Confirmed",
          steps: [
            { name: "Order Placed", completed: true, timestamp: new Date().toISOString() },
            { name: formData.paymentMethod === "cod" ? "Pending Payment" : "Payment Received", completed: formData.paymentMethod !== "cod", timestamp: null },
            { name: "Service Confirmed", completed: false, timestamp: null },
            { name: "In Progress", completed: false, timestamp: null },
            { name: "Completed", completed: false, timestamp: null }
          ]
        }
      };

      const existingBookings = JSON.parse(localStorage.getItem("bookings")) || [];
      const existingOrders = JSON.parse(localStorage.getItem("clientOrders")) || [];
      
      localStorage.setItem("bookings", JSON.stringify([booking, ...existingBookings]));
      localStorage.setItem("clientOrders", JSON.stringify([booking, ...existingOrders]));
      localStorage.setItem("lastQuickBuy", JSON.stringify(booking));

      // Generate and preview bill
      previewBill(booking);

    } catch (error) {
      console.error("❌ Booking failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  if (!selectedProduct && !provider) {
    return (
      <div className="quick-buy-container">
        <div className="text-center">
          <div className="loading-spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }}></div>
          <h2 className="quick-buy-title">Loading Booking Details</h2>
          <p className="quick-buy-subtitle">Preparing your seamless booking experience</p>
        </div>
      </div>
    );
  }

  const stepTitles = ["Personal Details", "Service Details", "Payment Method", "Confirmation"];
  const stepIcons = ["👤", "📅", "💳", "✅"];

  const breakdown = calculateBreakdown();

  return (
    <div className="quick-buy-container">
      {/* Bill Preview Modal */}
      {generatedBill && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content bill-preview-modal"
          >
            <div className="modal-header">
              <h2>📄 Your Booking Invoice</h2>
              <button
                onClick={() => setGeneratedBill(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="bill-preview-content">
              <div className="bill-preview-frame">
                <iframe 
                  src={generatedBill} 
                  title="Bill Preview"
                  width="100%" 
                  height="400"
                />
              </div>
              
              <div className="bill-actions">
                <button
                  onClick={() => downloadBill(JSON.parse(localStorage.getItem("lastQuickBuy")))}
                  className="download-bill-btn"
                >
                  📥 Download Bill PDF
                </button>
                <button
                  onClick={() => {
                    setGeneratedBill(null);
                    navigate('/client/orders', { 
                      state: { 
                        bookingSuccess: true, 
                        bookingId: JSON.parse(localStorage.getItem("lastQuickBuy"))?.id 
                      } 
                    });
                  }}
                  className="continue-btn"
                >
                  ✅ Continue to Orders
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="quick-buy-content">
        <div className="quick-buy-header">
          <h1 className="quick-buy-title">Quick Booking</h1>
          <p className="quick-buy-subtitle">Complete your booking in 4 simple steps</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-line"></div>
          <div 
            className="progress-line-active"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
          
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="progress-step">
              <div className={`progress-circle ${step >= stepNumber ? 'active' : ''}`}>
                {stepIcons[stepNumber - 1]}
              </div>
              <span className={`progress-label ${step >= stepNumber ? 'active' : ''}`}>
                {stepTitles[stepNumber - 1]}
              </span>
            </div>
          ))}
        </div>

        <div className="booking-content">
          {/* Order Summary Sidebar */}
          <div className="order-summary-card">
            <div className="order-summary-header">
              <div className="order-summary-icon">📦</div>
              <h2 className="order-summary-title">Order Summary</h2>
            </div>

            {selectedProduct && (
              <div className="product-card">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = "/assets/default-product.png";
                  }}
                />
                <div className="product-info">
                  <h3 className="product-name">{selectedProduct.name}</h3>
                  <p className="product-price">₹{selectedProduct.price}</p>
                  <p className="product-unit">per item</p>
                </div>
              </div>
            )}

            <div className="price-breakdown">
              <div className="price-row">
                <span className="price-label">Quantity:</span>
                <span className="price-value">{formData.quantity}</span>
              </div>
              
              <div className="price-row">
                <span className="price-label">Base Amount:</span>
                <span className="price-value">₹{breakdown.subtotal}</span>
              </div>

              {breakdown.urgencyFee > 0 && (
                <div className="price-row">
                  <span className="price-label">Urgency Fee:</span>
                  <span className="price-value" style={{ color: '#f59e0b' }}>
                    ₹{breakdown.urgencyFee}
                  </span>
                </div>
              )}

              <div className="price-row">
                <span className="price-label">GST (18%):</span>
                <span className="price-value">₹{breakdown.tax}</span>
              </div>

              <div className="price-total">
                <span className="total-label">Total Amount:</span>
                <span className="total-amount">₹{breakdown.total}</span>
              </div>
            </div>

            {provider && (
              <div className="provider-info">
                <div className="provider-header">
                  <div className="provider-icon">🏢</div>
                  <h4 className="provider-title">Service Provider</h4>
                </div>
                <p className="provider-name">{provider.name}</p>
                {provider.rating && (
                  <div className="provider-rating">
                    <div className="rating-stars">
                      {"★".repeat(Math.floor(provider.rating))}
                      {"☆".repeat(5 - Math.floor(provider.rating))}
                    </div>
                    <span className="rating-value">({provider.rating})</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Form */}
          <div className="booking-form-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Personal Details */}
                {step === 1 && (
                  <div>
                    <div className="step-header">
                      <div className="step-icon personal">👤</div>
                      <div>
                        <h2 className="step-title">Personal Details</h2>
                        <p className="step-subtitle">Tell us how we can reach you</p>
                      </div>
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label required">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label required">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="+91 9876543210"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Contact Preference</label>
                        <select
                          name="contactPreference"
                          value={formData.contactPreference}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="phone">Phone Call</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="email">Email</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label required">Complete Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="3"
                          className="form-textarea"
                          placeholder="Enter your complete delivery address"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Your city"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">PIN Code</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="123456"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Service Details */}
                {step === 2 && (
                  <div>
                    <div className="step-header">
                      <div className="step-icon service">📅</div>
                      <div>
                        <h2 className="step-title">Service Details</h2>
                        <p className="step-subtitle">When and how you need the service</p>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Service Type</label>
                        <input
                          type="text"
                          name="serviceType"
                          value={formData.serviceType}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Service type"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Quantity</label>
                        <div className="quantity-controls">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(-1)}
                            className="quantity-btn"
                          >
                            −
                          </button>
                          <span className="quantity-display">
                            {formData.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(1)}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label required">Service Date</label>
                        <input
                          type="date"
                          name="serviceDate"
                          value={formData.serviceDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Preferred Time</label>
                        <input
                          type="time"
                          name="serviceTime"
                          value={formData.serviceTime}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Urgency Level</label>
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="low">Low (Standard Timeline)</option>
                        <option value="normal">Normal</option>
                        <option value="high">High (+20% fee)</option>
                        <option value="urgent">Urgent (+50% fee)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Special Instructions</label>
                      <textarea
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleChange}
                        rows="3"
                        className="form-textarea"
                        placeholder="Any special requirements, preferences, or instructions for the service provider..."
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Method */}
                {step === 3 && (
                  <div>
                    <div className="step-header">
                      <div className="step-icon payment">💳</div>
                      <div>
                        <h2 className="step-title">Payment Method</h2>
                        <p className="step-subtitle">Choose how you'd like to pay</p>
                      </div>
                    </div>

                    <div className="payment-methods">
                      <div 
                        className={`payment-method ${formData.paymentMethod === "card" ? "selected" : ""}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "card" }))}
                      >
                        <div className="payment-method-header">
                          <div className="payment-radio"></div>
                          <span className="payment-method-title">Credit/Debit Card</span>
                        </div>
                        <p className="payment-method-description">Pay securely online</p>
                      </div>

                      <div 
                        className={`payment-method ${formData.paymentMethod === "cod" ? "selected" : ""}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "cod" }))}
                      >
                        <div className="payment-method-header">
                          <div className="payment-radio"></div>
                          <span className="payment-method-title">Cash on Delivery</span>
                        </div>
                        <p className="payment-method-description">Pay when service is completed</p>
                      </div>
                    </div>

                    {formData.paymentMethod === "card" && (
                      <div className="card-details">
                        <h3 className="card-details-title">Card Details</h3>
                        
                        <div className="form-group">
                          <label className="form-label required">Cardholder Name</label>
                          <input
                            type="text"
                            name="cardholderName"
                            value={formData.cardholderName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter cardholder name"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label required">Card Number</label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formatCardNumber(formData.cardNumber)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '');
                              if (value.length <= 16) {
                                setFormData(prev => ({ ...prev, cardNumber: value }));
                              }
                            }}
                            className="form-input"
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                          />
                        </div>

                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label required">Expiry Date</label>
                            <input
                              type="text"
                              name="expiryDate"
                              value={formatExpiryDate(formData.expiryDate)}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 4) {
                                  setFormData(prev => ({ ...prev, expiryDate: value }));
                                }
                              }}
                              className="form-input"
                              placeholder="MM/YY"
                              maxLength="5"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label required">CVV</label>
                            <input
                              type="text"
                              name="cvv"
                              value={formData.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 4) {
                                  setFormData(prev => ({ ...prev, cvv: value }));
                                }
                              }}
                              className="form-input"
                              placeholder="123"
                              maxLength="4"
                            />
                          </div>
                        </div>

                        <div className="security-badge">
                          <div className="security-badge-content">
                            <div className="security-icon">🔒</div>
                            <div className="security-text">
                              <p className="security-title">Secure Payment</p>
                              <p className="security-description">Your payment information is encrypted and secure</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.paymentMethod === "cod" && (
                      <div className="security-badge">
                        <div className="security-badge-content">
                          <div className="security-icon">💰</div>
                          <div className="security-text">
                            <p className="security-title">Cash on Delivery Selected</p>
                            <p className="security-description">
                              You'll pay ₹{breakdown.total} when the service is completed to your satisfaction.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                  <div>
                    <div className="step-header">
                      <div className="step-icon confirm">✅</div>
                      <div>
                        <h2 className="step-title">Confirm Booking</h2>
                        <p className="step-subtitle">Review and confirm your booking details</p>
                      </div>
                    </div>

                    <div className="confirmation-card">
                      <div className="confirmation-header">
                        <div className="confirmation-icon">✨</div>
                        <div>
                          <h3 className="confirmation-title">Ready to Complete Your Booking!</h3>
                          <p className="confirmation-subtitle">Please review your details before confirming</p>
                        </div>
                      </div>

                      <div className="confirmation-details">
                        <div>
                          <div className="confirmation-detail">
                            <span className="detail-label">Service:</span>
                            <span className="detail-value">{formData.serviceType}</span>
                          </div>
                          <div className="confirmation-detail">
                            <span className="detail-label">Provider:</span>
                            <span className="detail-value">{provider?.name}</span>
                          </div>
                          <div className="confirmation-detail">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{formData.serviceDate || "Flexible"}</span>
                          </div>
                          <div className="confirmation-detail">
                            <span className="detail-label">Contact:</span>
                            <span className="detail-value">{formData.phone}</span>
                          </div>
                        </div>
                        <div>
                          <div className="confirmation-detail">
                            <span className="detail-label">Payment:</span>
                            <span className="detail-value">
                              {formData.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                            </span>
                          </div>
                          <div className="confirmation-detail">
                            <span className="detail-label">Base Amount:</span>
                            <span className="detail-value">₹{breakdown.subtotal}</span>
                          </div>
                          {breakdown.urgencyFee > 0 && (
                            <div className="confirmation-detail">
                              <span className="detail-label">Urgency Fee:</span>
                              <span className="detail-value">₹{breakdown.urgencyFee}</span>
                            </div>
                          )}
                          <div className="confirmation-detail">
                            <span className="detail-label">GST (18%):</span>
                            <span className="detail-value">₹{breakdown.tax}</span>
                          </div>
                          <div className="confirmation-detail">
                            <span className="detail-label">Total Amount:</span>
                            <span className="detail-value" style={{ color: '#059669', fontWeight: '700', fontSize: '1.1em' }}>
                              ₹{breakdown.total}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="secure-booking">
                      <div className="secure-booking-content">
                        <div className="secure-icon">🔒</div>
                        <div className="secure-text">
                          <p className="secure-title">Your booking is secure</p>
                          <p className="secure-description">
                            {formData.paymentMethod === "cod" 
                              ? "Pay only after service completion and satisfaction" 
                              : "Your payment information is encrypted with bank-level security"
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bill-note">
                      <div className="bill-note-content">
                        <div className="bill-icon">📄</div>
                        <div className="bill-text">
                          <p className="bill-title">Instant Bill Generation</p>
                          <p className="bill-description">
                            After confirmation, you'll receive a detailed PDF invoice with complete breakdown
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="navigation-buttons">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="nav-btn back"
                    >
                      ← Previous
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="nav-btn back"
                    >
                      ← Back to Services
                    </button>
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="nav-btn continue"
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={loading}
                      className="nav-btn confirm"
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner"></div>
                          Processing...
                        </>
                      ) : (
                        `✅ ${formData.paymentMethod === "cod" ? "Confirm Booking" : `Pay ₹${breakdown.total}`}`
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBuyPage;