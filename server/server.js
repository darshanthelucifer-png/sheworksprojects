// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const connectDB = require("./config/db");
const path = require("path");

// ----------------- Connect to Database -----------------
connectDB();

// ----------------- Initialize App -----------------
const app = express();

// ----------------- Middlewares -----------------
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------- Routes -----------------
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);

// Default route
app.get("/", (req, res) => res.send("SheWorks API is running... 🚀"));

// ----------------- Error Handling -----------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
