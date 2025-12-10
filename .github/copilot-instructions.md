# 🧠 SheWorks – AI Coding Agent Guide

This document provides essential context for AI coding assistants working within the **SheWorks** project.  
It outlines architecture, conventions, workflows, and integration details so AI agents can generate contextually correct, production-ready code.

---

## 🏗️ Project Overview

**SheWorks** is a full-stack MERN web platform that empowers **women entrepreneurs** running home-based businesses.  
It connects **Service Providers** (women offering services) with **Clients** (customers booking services).  
The app enables:
- Profile creation for both roles  
- Browsing and booking of categorized services  
- Real-time chat  
- Ratings and reviews  
- Online/cash payments  
- Provider dashboards for managing bookings and earnings

**Tech Stack:**
- **Frontend:** React.js + React Router + Framer Motion + TailwindCSS  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB + Mongoose  
- **Auth:** JWT-based authentication  
- **Payment:** Integrated via provider payment details or future gateway  
- **Chat:** Real-time messaging (likely Socket.io integration)

---

## 🧩 Architecture Overview

**Monorepo Structure (typical):**
/client
├── src/components
├── src/pages
├── src/context
├── src/hooks
└── src/App.jsx

/server
├── models/ → Mongoose schemas (User, Service, Booking, Chat, Review)
├── routes/ → Express route definitions for each module
├── controllers/ → Business logic for routes
├── middleware/ → Auth & validation logic
├── config/ → DB connection & environment setup
└── server.js → Entry point

markdown
Copy code

### Core Modules
| Module | Description | Key Interactions |
|---------|--------------|------------------|
| **Auth** | Handles registration/login for both roles with a role dropdown. | `/auth/register`, `/auth/login` |
| **Client** | Profile management, service browsing, bookings, chats. | Interacts with `Service`, `Booking`, `Chat`, and `Review` APIs. |
| **Provider** | Profile creation, portfolio upload, manage bookings, earnings, reviews, chats. | Interacts with `Booking`, `Chat`, `Review` models. |
| **Booking** | Connects client ↔ provider. Tracks status, payment method, and timeline. | BookingController, Booking model |
| **Chat** | Real-time messaging between client and provider. | WebSocket/Socket.io integration |
| **Review** | Ratings and feedback. Affects provider’s overall score. | ReviewController, Review model |

---

## 🔄 Data Flow (Simplified)

Client → selects service → sees Providers
→ chooses Provider → clicks “Book Service”
→ fills booking form (details + payment)
→ Booking stored in MongoDB
→ Provider notified via dashboard/chat
→ Provider accepts/rejects → Client notified
→ Chat & status updates continue until completion

markdown
Copy code

---

## 🧭 Developer Workflows

| Action | Command / Flow |
|--------|----------------|
| **Start frontend** | `cd client && npm start` |
| **Start backend** | `cd server && node server.js` or `nodemon server.js` |
| **Install dependencies** | `npm install` in both `/client` and `/server` |
| **Environment setup** | `.env` includes: `MONGO_URI`, `JWT_SECRET`, and optionally `PORT` |
| **Debugging tip** | Ensure MongoDB is running; check for “Cannot overwrite model” errors due to duplicate model imports. Restart the server if that occurs. |

---

## ⚙️ Coding Conventions & Patterns

- **React components** follow modular structure — pages in `/src/pages`, reusable components in `/src/components`.
- **Routing** handled via `react-router-dom`.  
  - Example: `/login` → `/register` → `/client-dashboard` or `/provider-dashboard` based on role.
- **State management**: local state + context/hooks for auth/session data.
- **Animations:** use **Framer Motion** for transitions between views and on buttons/cards.
- **Styling:** TailwindCSS with responsive design; prefer `flex`, `grid`, and `p-4`, `rounded-2xl` utilities.
- **Forms:** always validate input before submission (email, password, phone, etc.).
- **API calls:** via Axios or Fetch → endpoints under `/api/...` on backend.
- **Naming:**  
  - Components: `PascalCase`  
  - Variables & hooks: `camelCase`  
  - Models: singular (e.g., `User`, `Booking`, `Service`)  

---

## 🔗 Integration Points

| Integration | Description |
|--------------|--------------|
| **Chat** | Real-time chat powered by Socket.io; messages stored in DB. |
| **Payment** | Providers define UPI/account details; client selects payment mode (online/COD). |
| **Notifications** | Booking confirmations, status updates, and review submissions. |
| **Image Uploads** | Provider portfolios include images with price tags; stored locally or in cloud storage (e.g., Cloudinary). |

---

## 📐 Example Flows for AI Agents

- **Add a new service category:**
  1. Update service list in `/client/pages/CategoryServices.jsx`
  2. Add backend entry in `ServiceModel.js`
  3. Ensure providers can register under that category.

- **Extend Provider Dashboard:**
  - Create card component under `/client/components/provider/DashboardCards.jsx`
  - Fetch stats from `/api/bookings/stats/:providerId`
  - Display with motion animation and responsive grid.

- **Create new API route:**
  - Define route in `/server/routes/`
  - Implement controller logic in `/server/controllers/`
  - Reference existing routes for consistent error handling.

---

## 🧰 Helpful Tips for AI Agents

- Always check user `role` (`client` or `provider`) before routing or rendering dashboard components.
- Use **JWT authentication middleware** to secure private routes.
- Avoid redefining Mongoose models — import existing ones to prevent `OverwriteModelError`.
- Maintain consistent API response format: `{ success, data, message }`.
- All inputs must be validated and sanitized before database entry.
- For dynamic UI behavior (booking updates, chat), prefer real-time sockets over polling.

---

## 🧾 References
- **Frontend Entry:** `/client/src/App.jsx`
- **Backend Entry:** `/server/server.js`
- **Authentication Flow:** `/server/routes/authRoutes.js`
- **Database Models:** `/server/models/*`
- **Key Components:** `ProviderProfileView.jsx`, `ClientDashboard.jsx`, `BookingPage.js`
- **Chat Integration (Next Step):** `/server/socket.js` or `/client/pages/ChatPage.jsx`

---

*Last Updated: October 2025*  
*(Maintained by: SheWorks development team)*  