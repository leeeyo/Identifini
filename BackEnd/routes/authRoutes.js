const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { protect } = require("../middleware/authMiddleware")

// Log available controller methods for debugging
console.log("Auth Controller Methods:", Object.keys(authController))

// GET /api/auth/test - Test route
router.get("/test", (req, res) => {
  console.log("GET /api/auth/test route hit")
  res.json({ message: "Auth routes are working" })
})

// GET /api/auth/register - Show registration info
router.get("/register", (req, res) => {
  console.log("GET /api/auth/register route hit")
  res.json({
    message: "Registration endpoint - use POST to register",
    example: {
      username: "user@example.com",
      password: "password123",
      name: "John Doe",
      email: "user@example.com",
      themePreference: "light", // Added theme preference
    },
  })
})

// POST /api/auth/register - Register a new user
router.post("/register", authController.register)

// GET /api/auth/login - Show login info
router.get("/login", (req, res) => {
  console.log("GET /api/auth/login route hit")
  res.json({
    message: "Login endpoint - use POST to login",
    example: {
      username: "user@example.com",
      password: "password123",
    },
  })
})

// POST /api/auth/login - Login a user
router.post("/login", authController.login)

// POST /api/auth/social-login - Social login
router.post("/social-login", authController.socialLogin)

// GET /api/auth/google - Google OAuth redirect
router.get("/google", authController.googleAuth)

// OAuth callback route for Google
router.get("/google/callback", authController.googleCallback)

// GET /api/auth/profile - Get user profile (protected route)
router.get("/profile", protect, authController.getProfile)

// PUT /api/auth/profile - Update user profile (protected route)
router.put("/profile", protect, authController.updateProfile)


module.exports = router

