// repositories/userRepository.js
const User = require("../models/User");

class UserRepository {
  // Create a new user
  async create(userData) {
    const newUser = new User(userData);
    return await newUser.save();
  }

  // Get a user by ID
  async getById(id) {
    return await User.findById(id);
  }

  // Get a user by username
  async getByUsername(username) {
    return await User.findOne({ username });
  }

  // Get a user by email
  async getByEmail(email) {
    return await User.findOne({ email });
  }

  // Update a user
  async update(id, userData) {
    return await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true });
  }

  // Delete a user
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  // Get all users (useful for admin)
  async getAll(filters = {}) {
    return await User.find(filters);
  }
}

module.exports = new UserRepository();