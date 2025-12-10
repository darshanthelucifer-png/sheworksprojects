import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./BookingPage.css";

const BookingPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  
  const [formData, setFormData] = useState({
    serviceType: "",
    description: "",
    serviceDate: "",
    contact: "",
    paymentMethod: "online"
  });

  useEffect(() => {
    // Load provider details
    const providerDetails = location.state?.providerDetails || 
                           JSON.parse(localStorage.getItem(`provider_${providerId}`)) || 
                           {
                             name: "Service Provider",
                             priceRange: "₹500 - ₹5000"
                           };
    setProvider(providerDetails);

    // Pre-fill service type if coming from service list
    if (location.state?.serviceType) {
      setFormData(prev => ({ ...prev, serviceType: location.state.serviceType }));
    }
  }, [providerId, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ADD CONSOLE LOGS TO DEBUG
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    console.log("🔘 Confirm button clicked");
    
    // Validate form
    if (!formData.serviceType.trim()) {
      alert("Please select a service type");
      return;
    }
    if (!formData.serviceDate) {
      alert("Please select a service date");
      return;
    }
    if (!formData.contact.trim()) {
      alert("Please enter your contact number");
      return;
    }

    console.log("✅ Form validation passed");
    setLoading(true);

    try {
      // Create booking object
      const booking = {
        id: `booking_${Date.now()}`,
        providerId,
        providerName: provider?.name || "Service Provider",
        serviceType: formData.serviceType,
        description: formData.description,
        serviceDate: formData.serviceDate,
        contact: formData.contact,
        paymentMethod: formData.paymentMethod,
        amount: provider?.priceRange || "₹999",
        status: "pending",
        bookingDate: new Date().toISOString(),
        clientName: JSON.parse(localStorage.getItem("user"))?.name || "Client"
      };

      console.log("📦 Booking object created:", booking);

      // Save to localStorage
      const existingBookings = JSON.parse(localStorage.getItem("bookings")) || [];
      const existingOrders = JSON.parse(localStorage.getItem("clientOrders")) || [];
      
      localStorage.setItem("bookings", JSON.stringify([booking, ...existingBookings]));
      localStorage.setItem("clientOrders", JSON.stringify([booking, ...existingOrders]));
      localStorage.setItem("currentBooking", JSON.stringify(booking));

      console.log("💾 Booking saved to localStorage");

      // Show success message
      setTimeout(() => {
        alert(`🎉 Booking confirmed! Your booking ID: ${booking.id}`);
        
        // Navigate to payment page
        navigate(`/client/payment/${providerId}`, {
          state: { 
            bookingData: booking,
            providerDetails: provider
          }
        });
      }, 500);

    } catch (error) {
      console.error("❌ Booking failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ADD THIS DEBUG FUNCTION
  const testBooking = () => {
    console.log("🧪 Testing booking function...");
    console.log("Form Data:", formData);
    console.log("Provider:", provider);
    console.log("User:", JSON.parse(localStorage.getItem("user")));
    handleConfirmBooking({ preventDefault: () => {} });
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Book Service</h1>
        <p>Complete your booking details</p>
        
        {/* DEBUG BUTTON - REMOVE IN PRODUCTION */}
        <button 
          onClick={testBooking}
          style={{
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          🐛 Test Booking
        </button>
      </div>

      <div className="booking-content">
        {/* Provider Info */}
        {provider && (
          <div className="provider-card">
            <h3>Provider: {provider.name}</h3>
            <p>Price Range: {provider.priceRange}</p>
          </div>
        )}

        <form onSubmit={handleConfirmBooking} className="booking-form">
          {/* Service Type */}
          <div className="form-group">
            <label>Service Type *</label>
            <input
              type="text"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              placeholder="e.g., Hand Embroidery, Custom Gift"
              required
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Service Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your requirements in detail..."
              rows="4"
              className="form-textarea"
            />
          </div>

          {/* Service Date */}
          <div className="form-group">
            <label>Preferred Service Date *</label>
            <input
              type="date"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="form-input"
            />
          </div>

          {/* Contact */}
          <div className="form-group">
            <label>Contact Number *</label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Your phone number"
              required
              className="form-input"
            />
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label>Payment Method *</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="form-select"
            >
              <option value="online">Online Payment</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={loading}
            className="confirm-btn"
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Confirming...
              </>
            ) : (
              "✅ Confirm Booking"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;