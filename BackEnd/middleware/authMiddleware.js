const jwt = require("jsonwebtoken")
const User = require("../models/User")

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET)

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        return res.status(401).json({ error: "User not found" })
      }

      next()
    } catch (error) {
      console.error("Auth middleware error:", error)

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token" })
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" })
      }

      res.status(401).json({ error: "Not authorized, token failed" })
    }
  } else {
    res.status(401).json({ error: "Not authorized, no token" })
  }
}

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ error: "Not authorized as an admin" })
  }
}

module.exports = { protect, admin }

