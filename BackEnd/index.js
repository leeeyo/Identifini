const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

const cardRoutes = require("./routes/cardRoutes") // Make sure the path is correct and case-sensitive

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/cards", cardRoutes)

// Basic route for testing
app.get("/", (req, res) => {
  res.send("API is running...")
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {

  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect:", err))

