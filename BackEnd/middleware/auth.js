const jwt = require("jsonwebtoken")
const userRepository = require("../repositories/userRepository")

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "Authentication required" })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Find user by id
    const user = await userRepository.getById(decoded.id)

    if (!user) {
      return res.status(401).json({ error: "Invalid token" })
    }

    // Add user to request object
    req.user = user
    req.token = token

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ error: "Please authenticate" })
  }
}

module.exports = auth

