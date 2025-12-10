import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProviderById } from "../../data";
import "./ProviderChat.css";

export default function ProviderChat() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState(null);
  const [booking, setBooking] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const providerSession = localStorage.getItem('providerSession');
    if (!providerSession) {
      navigate('/provider/login');
      return;
    }

    const sessionData = JSON.parse(providerSession);
    const providerDetails = getProviderById(sessionData.id);
    setProvider(providerDetails);

    // Fetch booking details
    const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const currentBooking = allBookings.find(b => b.id === bookingId);
    setBooking(currentBooking);

    // Initialize chat messages
    if (currentBooking) {
      setMessages([
        { 
          id: 1, 
          sender: "customer", 
          text: `Hello! I'm interested in your ${currentBooking.serviceType} service.`, 
          timestamp: new Date(Date.now() - 3600000).toISOString() 
        },
        { 
          id: 2, 
          sender: "provider", 
          text: `Hi ${currentBooking.clientName}! Thank you for your interest. I'd be happy to help you with ${currentBooking.serviceType}.`, 
          timestamp: new Date(Date.now() - 1800000).toISOString() 
        },
        { 
          id: 3, 
          sender: "customer", 
          text: "That's great! Could you tell me more about your availability?", 
          timestamp: new Date(Date.now() - 600000).toISOString() 
        }
      ]);
    }
  }, [bookingId, navigate]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage = { 
      id: messages.length + 1, 
      sender: "provider", 
      text: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Auto-reply after 2 seconds
    setTimeout(() => {
      const autoReply = {
        id: messages.length + 2,
        sender: "customer",
        text: "Thanks for your response! I'll get back to you soon.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, autoReply]);
    }, 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!booking) {
    return (
      <div className="chat-error">
        <h2>Booking Not Found</h2>
        <p>Unable to load chat for this booking.</p>
        <button onClick={() => navigate("/provider/manage-bookings")}>
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="provider-chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <button 
            className="back-btn"
            onClick={() => navigate("/provider/manage-bookings")}
          >
            ← Back
          </button>
          <div className="client-info">
            <h3>Chat with {booking.clientName}</h3>
            <p>Booking #{bookingId} • {booking.serviceType}</p>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn">📞 Call</button>
          <button className="action-btn">ℹ️ Info</button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === "provider" ? "sent" : "received"}`}
          >
            <div className="message-content">
              <p>{msg.text}</p>
              <span className="message-time">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="chat-input-container">
        <div className="chat-input">
          <input
            type="text"
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button 
            onClick={sendMessage}
            disabled={!input.trim()}
            className="send-btn"
          >
            📤
          </button>
        </div>
        <div className="quick-actions">
          <button className="quick-btn">📅 Suggest Date</button>
          <button className="quick-btn">💰 Discuss Price</button>
          <button className="quick-btn">📍 Location</button>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="booking-summary">
        <h4>Booking Summary</h4>
        <div className="summary-details">
          <p><strong>Service:</strong> {booking.serviceType}</p>
          <p><strong>Client:</strong> {booking.clientName}</p>
          <p><strong>Contact:</strong> {booking.clientContact}</p>
          <p><strong>Status:</strong> 
            <span className={`status ${booking.status}`}>
              {booking.status}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}