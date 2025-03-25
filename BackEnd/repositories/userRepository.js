const User = require("../models/User")

class UserRepository {
  // Create a new user
  async create(userData) {
    const user = new User(userData)
    return await user.save()
  }

  // Find user by ID
  async getById(id) {
    return await User.findById(id).select("-password")
  }

  // Find user by username
  async getByUsername(username) {
    return await User.findOne({ username })
  }

  // Find user by email
  async getByEmail(email) {
    return await User.findOne({ email })
  }

  // Update user
  async update(id, userData) {
    console.log("Repository updating user:", id, "with data:", userData)

    // Use { new: true } to return the updated document
    // Use { runValidators: true } to ensure validation runs on update
    const updatedUser = await User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    }).select("-password")

    console.log("Repository updated user result:", updatedUser)

    return updatedUser
  }

  // Delete user
  async delete(id) {
    return await User.findByIdAndDelete(id)
  }

  // Get all users (for admin)
  async getAll() {
    return await User.find().select("-password")
  }
}

module.exports = new UserRepository()

