const jwt = require("jsonwebtoken")
const userService = require("../services/userService")

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  })
}

class AuthController {
  // Register a new user
  async register(req, res) {
    try {
      console.log("Register called with data:", req.body)

      // Check if required fields are provided
      const { username, password, name, email } = req.body
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" })
      }

      // Register the user
      const user = await userService.registerUser({
        username,
        password,
        name,
        email,
      })

      // Generate token
      const token = generateToken(user._id)

      // Return user data and token
      res.status(201).json({
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token,
      })
    } catch (error) {
      console.error("Error in register:", error)
      res.status(400).json({ error: error.message })
    }
  }

  // Login a user
  async login(req, res) {
    try {
      console.log("Login called with data:", req.body)

      // Check if required fields are provided
      const { username, password } = req.body
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" })
      }

      // Login the user
      const user = await userService.loginUser(username, password)

      // Generate token
      const token = generateToken(user._id)

      // Return user data and token
      res.status(200).json({
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        created_at: user.created_at,
        token,
      })
    } catch (error) {
      console.error("Error in login:", error)
      res.status(401).json({ error: error.message })
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      // Get user from middleware
      if (!req.user) {
        return res.status(401).json({ error: "Not authorized" })
      }

      // Return user data
      res.status(200).json(req.user)
    } catch (error) {
      console.error("Error in getProfile:", error)
      res.status(400).json({ error: error.message })
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      // Get user from middleware
      if (!req.user) {
        return res.status(401).json({ error: "Not authorized" })
      }

      console.log("Update profile request body:", req.body)

      // Update user
      const updatedUser = await userService.updateUser(req.user._id, req.body)

      console.log("Updated user from service:", updatedUser)

      // Return updated user data with all fields including profilePicture
      res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      })
    } catch (error) {
      console.error("Error in updateProfile:", error)
      res.status(400).json({ error: error.message })
    }
  }
}

// Make sure we're exporting the controller correctly
module.exports = new AuthController()

