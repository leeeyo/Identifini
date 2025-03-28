const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const compression = require("compression")
const path = require("path")
const { requestLogger, errorLogger } = require("./middleware/loggingMiddleware")
// const { cacheMiddleware } = require("./middleware/cacheMiddleware")
require("dotenv").config()

const app = express()

// Create logs directory if it doesn't exist
const fs = require("fs")
if (!fs.existsSync(path.join(__dirname, "logs"))) {
  fs.mkdirSync(path.join(__dirname, "logs"))
}

// Enhanced security middleware
app.use(helmet())

// Compression middleware
app.use(compression())

// Logging middleware
app.use(requestLogger)

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
})

// Apply rate limiting to API routes
app.use("/api", apiLimiter)

// Standard middleware
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
const menuRoutes = require("./routes/menuRoutes")
const searchRoutes = require("./routes/searchRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes")

// Register routes
app.use("/api/cards", cardRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/sub-users", subUserRoutes)
app.use("/api/menus", menuRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/analytics", analyticsRoutes)

// Error logging middleware
app.use(errorLogger)

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    error: "Server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
    message: `Route ${req.originalUrl} not found`,
  })
})

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

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
  // Close server & exit process
  server.close(() => process.exit(1))
})

