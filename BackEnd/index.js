const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ORDER MATTERS!
require('./models/User');
require('./models/Card');

// Import routes
const cardRoutes = require("./routes/cardRoutes");
const userRoutes = require("./routes/userRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {

  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect:", err));