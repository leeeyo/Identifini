const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

// Improved CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Other middleware
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

// Add a test route specifically for cards
app.get("/api/cards-test", (req, res) => {
  console.log("GET /api/cards-test route hit")
  res.json({
    message: "Cards test route is working",
    cards: [
      {
        _id: "test-id-1",
        card_username: "test-user",
        display_name: "Test User",
        bio: "This is a test card",
        created_at: new Date().toISOString(),
      },
    ],
  })
})

// Import routes
const cardRoutes = require("./routes/cardRoutes")
const authRoutes = require("./routes/authRoutes")
const publicRoutes = require("./routes/publicRoutes")

// Register routes
app.use("/api/cards", cardRoutes)
app.use("/api/auth", authRoutes)
app.use("/api", publicRoutes) // Register public routes

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

