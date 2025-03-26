// index.js
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Add a test route at the root level
app.get("/", (req, res) => {
  res.send("API is running...")
})

// Add a test route that doesn't require database
app.get("/api/ping", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Add the /test route
app.get("/test", (req, res) => {
  res.json({
    message: "Test route is working",
    timestamp: new Date().toISOString(),
  })
})

// Import routes
const cardRoutes = require("./routes/cardRoutes")
const authRoutes = require("./routes/authRoutes")
const subUserRoutes = require("./routes/subUserRoutes")

// Register routes - IMPORTANT: Make sure these are router objects, not controller objects
app.use("/api/cards", cardRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/sub-users", subUserRoutes)  // This should be the router, not the controller

const PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Test the API at http://localhost:${PORT}/api/ping`)
  console.log(`Test the simple test route at http://localhost:${PORT}/test`)
  console.log(`Test the auth routes at http://localhost:${PORT}/api/auth/test`)
})

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect:", err))