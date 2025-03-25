const userRepository = require("../repositories/userRepository")
const bcrypt = require("bcryptjs")

class UserService {
  // Register a new user
  async registerUser(userData) {
    if (!userData) throw new Error("User data is required")

    // Check if username or email already exists
    const existingUsername = await userRepository.getByUsername(userData.username)
    if (existingUsername) throw new Error("Username already exists")

    if (userData.email) {
      const existingEmail = await userRepository.getByEmail(userData.email)
      if (existingEmail) throw new Error("Email already exists")
    }

    return await userRepository.create(userData)
  }

  // Login user
  async loginUser(username, password) {
    if (!username || !password) throw new Error("Username and password are required")

    // Find user by username
    const user = await userRepository.getByUsername(username)
    if (!user) throw new Error("Invalid credentials")

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) throw new Error("Invalid credentials")

    // Don't return the password
    const userResponse = user.toObject()
    delete userResponse.password

    return userResponse
  }

  // Get user by ID
  async getUserById(id) {
    if (!id) throw new Error("User ID is required")

    const user = await userRepository.getById(id)
    if (!user) throw new Error("User not found")

    return user
  }

  // Update user
  async updateUser(id, userData) {
    if (!id) throw new Error("User ID is required")
    if (!userData) throw new Error("User data is required")

    // If updating password, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10)
      userData.password = await bcrypt.hash(userData.password, salt)
    }

    return await userRepository.update(id, userData)
  }

  // Delete user
  async deleteUser(id) {
    if (!id) throw new Error("User ID is required")

    return await userRepository.delete(id)
  }
}

module.exports = new UserService()

