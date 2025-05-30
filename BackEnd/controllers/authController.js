const jwt = require("jsonwebtoken")
const userService = require("../services/userService")
const { OAuth2Client } = require("google-auth-library")

const JWT_SECRET = process.env.JWT_SECRET
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Initialize Google OAuth client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

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

  // Social login (Google)
  async socialLogin(req, res) {
    try {
      const { provider, token, userData } = req.body

      if (!provider || !token) {
        return res.status(400).json({ error: "Provider and token are required" })
      }

      let socialUser = null

      // Verify token based on provider
      if (provider === "google") {
        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()
        socialUser = {
          email: payload.email,
          name: payload.name,
          profilePicture: payload.picture,
          provider: "google",
          providerId: payload.sub,
        }
      } else {
        return res.status(400).json({ error: "Invalid provider" })
      }

      if (!socialUser) {
        return res.status(400).json({ error: "Failed to authenticate with provider" })
      }

      // Find or create user
      const user = await userService.findOrCreateSocialUser(socialUser)

      // Generate token
      const jwtToken = generateToken(user._id)

      // Return user data and token
      res.status(200).json({
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || socialUser.profilePicture,
        created_at: user.created_at,
        token: jwtToken,
      })
    } catch (error) {
      console.error("Error in social login:", error)
      res.status(401).json({ error: error.message || "Social authentication failed" })
    }
  }

  // Google OAuth redirect
  async googleAuth(req, res) {
    try {
      const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL + "/auth/google/callback")}&response_type=code&scope=email%20profile&access_type=offline`
      res.redirect(redirectUrl)
    } catch (error) {
      console.error("Error in Google OAuth redirect:", error)
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/google/callback?error=${encodeURIComponent(error.message || "Failed to authenticate with Google")}`,
      )
    }
  }

  // Add OAuth callback handler for Google
  async googleCallback(req, res) {
    try {
      const { code } = req.query

      if (!code) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/google/callback?error=${encodeURIComponent("Authorization code is missing")}`,
        )
      }

      // Exchange code for tokens
      const oauth2Client = new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        `${process.env.FRONTEND_URL}/auth/google/callback`,
      )

      const { tokens } = await oauth2Client.getToken(code)
      const idToken = tokens.id_token

      if (!idToken) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/google/callback?error=${encodeURIComponent("Failed to get ID token")}`,
        )
      }

      // Verify the ID token
      const ticket = await oauth2Client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()

      // Find or create user
      const socialUser = {
        email: payload.email,
        name: payload.name,
        profilePicture: payload.picture,
        provider: "google",
        providerId: payload.sub,
      }

      const user = await userService.findOrCreateSocialUser(socialUser)

      // Generate JWT token
      const jwtToken = generateToken(user._id)

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${jwtToken}`)
    } catch (error) {
      console.error("Error in Google OAuth callback:", error)
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/google/callback?error=${encodeURIComponent(error.message || "Failed to authenticate with Google")}`,
      )
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

module.exports = new AuthController()

