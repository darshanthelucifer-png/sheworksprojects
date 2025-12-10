import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatPage.css';

// ✅ Load providers data
import providersData from "../../data/providers.json";
import servicesData from "../../data/services.json";

const normalizeId = (str) =>
  str?.toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_") || "";

// ✅ Normalize image path (same logic used in product/service pages)
const normalizeImagePath = (path) => {
  if (!path) return "/assets/default-profile.png";
  return path.startsWith("public/")
    ? `/${path.replace(/^public\//, "")}`
    : path.startsWith("/")
    ? path
    : `/${path}`;
};

// ✅ Get service readable name
const getServiceName = (serviceId) => {
  if (!servicesData?.services) return serviceId;
  const key = normalizeId(serviceId);
  for (let service of servicesData.services) {
    const sub = service.subServices?.find(s => normalizeId(s.id) === key);
    if (sub?.name) return sub.name;
  }
  return serviceId;
};

const ChatPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [provider, setProvider] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // ✅ Load current user
    const user = JSON.parse(localStorage.getItem('currentUser')) || {
      name: "Customer",
      id: "client_" + Date.now()
    };
    setCurrentUser(user);

    // ✅ Load provider from providers.json
    const found = (providersData.providers || []).find(p =>
      p.id === providerId || p.id === parseInt(providerId)
    );

    if (found) {
      setProvider({
        ...found,
        serviceName: getServiceName(found.serviceId),
        image: normalizeImagePath(found.image || found.imagePath)
      });
    } else {
      setProvider({
        id: providerId,
        name: "Service Provider",
        image: "/assets/default-profile.png",
        serviceName: "General Service"
      });
    }

    // ✅ Load chat history
    const chatKey = `chat_${providerId}_${user.id}`;
    const saved = JSON.parse(localStorage.getItem("chats")) || {};
    const history = saved[chatKey] || [];

    // ✅ If first chat → send greeting
    if (history.length === 0 && found) {
      const welcome = {
        id: Date.now(),
        sender: "provider",
        text: `Hello! I'm ${found.name}. How can I help you with ${getServiceName(found.serviceId)} today?`,
        timestamp: new Date().toISOString(),
        status: "delivered"
      };
      saved[chatKey] = [welcome];
      localStorage.setItem("chats", JSON.stringify(saved));
      setMessages([welcome]);
    } else {
      setMessages(history);
    }

  }, [providerId]);

  const saveChat = (arr) => {
    const chatKey = `chat_${providerId}_${currentUser?.id}`;
    const saved = JSON.parse(localStorage.getItem("chats")) || {};
    saved[chatKey] = arr;
    localStorage.setItem("chats", JSON.stringify(saved));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now(),
      sender: "client",
      text: newMessage,
      timestamp: new Date().toISOString(),
      status: "sent"
    };

    const updated = [...messages, msg];
    setMessages(updated);
    saveChat(updated);
    setNewMessage("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const reply = {
        id: Date.now() + 1,
        sender: "provider",
        text: "Okay, noted 👍",
        timestamp: new Date().toISOString(),
        status: "delivered"
      };
      const final = [...updated, reply];
      setMessages(final);
      saveChat(final);
    }, 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <motion.div className="chat-page-wrapper">
      <motion.div className="chat-page">

        {/* Header */}
        <div className="chat-header">
          <button onClick={() => navigate(-1)} className="back-button">← Back</button>

          <img
            src={normalizeImagePath(provider?.image)}
            className="provider-avatar"
            alt="provider"
            onError={e => e.target.src = "/assets/default-profile.png"}
          />

          <div>
            <h3>{provider?.name}</h3>
            <p className="provider-service">{provider?.serviceName}</p>
          </div>

          <span className={`online-dot ${onlineStatus ? "online" : "offline"}`}></span>
        </div>

        {/* Messages */}
        <div className="chat-body">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                className={`message ${m.sender === "client" ? "sent" : "received"}`}
              >
                {m.sender === "provider" && (
                  <img src={normalizeImagePath(provider?.image)} className="provider-avatar" alt="" />
                )}
                <p>{m.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <p className="typing">{provider?.name} is typing...</p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input">
          <input
            value={newMessage}
            placeholder="Type message..."
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button className="send-button" onClick={handleSendMessage}>📤</button>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default ChatPage;
