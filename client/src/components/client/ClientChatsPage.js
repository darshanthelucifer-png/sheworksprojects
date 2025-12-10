import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./ClientChatsPage.css";

const ClientChatsPage = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Demo chat data with enhanced information
  const demoChats = [
    {
      id: 1,
      providerId: "1",
      providerName: "Anita Designs",
      providerImage: "/assets/default-profile.png",
      lastMessage: "Your embroidery design is ready for review",
      timestamp: "2024-01-15 14:30",
      unread: 2,
      service: "Hand Embroidery",
      online: true,
      lastActive: "2 min ago"
    },
    {
      id: 2,
      providerId: "2",
      providerName: "Meera Kitchen",
      providerImage: "/assets/default-profile.png",
      lastMessage: "Thank you for your order! The food will be delivered by 7 PM",
      timestamp: "2024-01-10 10:15",
      unread: 0,
      service: "South Indian Meals",
      online: false,
      lastActive: "1 hour ago"
    },
    {
      id: 3,
      providerId: "3",
      providerName: "Priya Beauty Studio",
      providerImage: "/assets/default-profile.png",
      lastMessage: "See you tomorrow for the appointment at 3 PM",
      timestamp: "2024-01-05 16:45",
      unread: 0,
      service: "Bridal Makeup",
      online: true,
      lastActive: "Online"
    }
  ];

  useEffect(() => {
    // Simulate loading chats
    const timer = setTimeout(() => {
      setChats(demoChats);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleChatClick = (providerId) => {
    navigate(`/client/chat/${providerId}`);
  };

  const handleBackToDashboard = () => {
    navigate("/client/dashboard");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageIcon = (message) => {
    if (message.includes('ready') || message.includes('completed')) return '✅';
    if (message.includes('thank you') || message.includes('thanks')) return '🙏';
    if (message.includes('appointment') || message.includes('meeting')) return '📅';
    if (message.includes('delivered') || message.includes('delivery')) return '🚚';
    return '💬';
  };

  if (loading) {
    return (
      <motion.div 
        className="chats-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="chats-header">
          <h2>💬 My Chats</h2>
          <p>Loading your conversations...</p>
        </div>
        <div className="loading-chats">
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              className="chat-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: item * 0.1 }}
            >
              <div className="skeleton-avatar"></div>
              <div className="skeleton-content">
                <div className="skeleton-line skeleton-name"></div>
                <div className="skeleton-line skeleton-service"></div>
                <div className="skeleton-line skeleton-message"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="chats-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="chats-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button 
          className="back-btn"
          onClick={handleBackToDashboard}
          whileHover={{ x: -5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Dashboard
        </motion.button>
        <h2>💬 My Chats</h2>
        <p>Communicate with your service providers</p>
      </motion.div>

      <div className="chats-list">
        <AnimatePresence>
          {chats.length === 0 ? (
            <motion.div 
              className="empty-chats"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <h3>No chats yet</h3>
              </motion.div>
              <p>Start a conversation with a service provider by booking a service</p>
              <motion.button 
                className="explore-btn"
                onClick={handleBackToDashboard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🛍️ Explore Services
              </motion.button>
            </motion.div>
          ) : (
            chats.map((chat, index) => (
              <motion.div
                key={chat.id}
                className="chat-item"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChatClick(chat.providerId)}
              >
                <div className="avatar-container">
                  <motion.img 
                    src={chat.providerImage} 
                    alt={chat.providerName}
                    className="provider-avatar"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    onError={(e) => {
                      e.target.src = "/assets/default-profile.png";
                    }}
                  />
                  {chat.online && <div className="online-indicator"></div>}
                </div>
                
                <div className="chat-info">
                  <div className="chat-header">
                    <h4>{chat.providerName}</h4>
                    <span className="chat-time">{formatTime(chat.timestamp)}</span>
                  </div>
                  <p className="service-name">{chat.service}</p>
                  <div className="message-preview">
                    <span className="message-icon">
                      {getMessageIcon(chat.lastMessage)}
                    </span>
                    <p className="last-message">{chat.lastMessage}</p>
                  </div>
                  <div className="chat-meta">
                    <span className={`status ${chat.online ? 'online' : 'offline'}`}>
                      {chat.online ? 'Online' : `Last active ${chat.lastActive}`}
                    </span>
                  </div>
                </div>
                
                {chat.unread > 0 && (
                  <motion.span 
                    className="unread-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {chat.unread}
                  </motion.span>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button for New Chat */}
      <motion.button
        className="fab-new-chat"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleBackToDashboard}
      >
        💬
      </motion.button>
    </motion.div>
  );
};

export default ClientChatsPage;