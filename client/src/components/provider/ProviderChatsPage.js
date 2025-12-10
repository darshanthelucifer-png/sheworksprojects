import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProviderChatsPage.css";

const ProviderChatsPage = () => {
  const navigate = useNavigate();
  const [chatList, setChatList] = useState([]);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    // LOAD CURRENT PROVIDER
    const currentProvider = JSON.parse(localStorage.getItem("currentProvider"));
    if (!currentProvider) {
      alert("Provider not logged in!");
      navigate("/provider/login");
      return;
    }
    setProvider(currentProvider);

    // LOAD ALL CHAT DATA
    const savedChats = JSON.parse(localStorage.getItem("chats")) || {};

    const formattedChats = [];

    Object.keys(savedChats).forEach((chatKey) => {
      // Only pick chats that belong to this provider
      if (chatKey.startsWith(`chat_${currentProvider.id}_`)) {
        const messages = savedChats[chatKey];
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        const clientId = lastMessage.senderId === currentProvider.id ? lastMessage.receiverId : lastMessage.senderId;

        formattedChats.push({
          chatKey,
          clientId,
          clientName: localStorage.getItem(`client_name_${clientId}`) || "Customer",
          clientImage: localStorage.getItem(`client_image_${clientId}`) || "/assets/default-profile.png",
          lastMessage: lastMessage.text,
          timestamp: lastMessage.timestamp,
          unread: messages.filter(msg => msg.sender === "client" && msg.status !== "read").length
        });
      }
    });

    // Sort newest first
    formattedChats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setChatList(formattedChats);
  }, [navigate]);

  const handleChatClick = (chatKey, clientId) => {
    navigate(`/provider/chat/${clientId}`, { state: { chatKey } });
  };

  return (
    <div className="provider-chats-container">
      <div className="chats-header">
        <h2>💬 Customer Chats</h2>
        <p>Respond and manage your client messages</p>
      </div>

      <div className="chats-list">
        {chatList.length === 0 ? (
          <div className="empty-chats">
            <h3>No chats yet</h3>
            <p>Your conversations with customers will appear here.</p>
          </div>
        ) : (
          chatList.map((chat) => (
            <div 
              key={chat.chatKey}
              className="chat-item"
              onClick={() => handleChatClick(chat.chatKey, chat.clientId)}
            >
              <div className="avatar-wrapper">
                <img 
                  src={chat.clientImage}
                  alt={chat.clientName}
                  className="client-avatar"
                  onError={(e) => (e.target.src = "/assets/default-profile.png")}
                />
              </div>

              <div className="chat-info">
                <div className="chat-header-row">
                  <h4>{chat.clientName}</h4>
                  <span className="chat-time">
                    {new Date(chat.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <p className="last-message">{chat.lastMessage}</p>
              </div>

              {chat.unread > 0 && (
                <span className="unread-badge">{chat.unread}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProviderChatsPage;
