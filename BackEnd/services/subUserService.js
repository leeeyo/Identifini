const User = require("../models/User")
const bcrypt = require("bcryptjs")

/**
 * Service for managing sub-users
 */
const subUserService = {
  /**
   * Create a new sub-user
   * @param {string} parentUserId - ID of the parent user
   * @param {Object} subUserData - Data for the new sub-user
   * @returns {Promise<Object>} - The created sub-user
   */
  async createSubUser(parentUserId, subUserData) {
    console.log("Creating sub-user for parent:", parentUserId)

    if (!parentUserId) {
      throw new Error("Parent user ID is required")
    }

    if (!subUserData) {
      throw new Error("Sub-user data is required")
    }

    // Validate required fields
    if (!subUserData.username) {
      throw new Error("Username is required")
    }

    if (!subUserData.password) {
      throw new Error("Password is required")
    }

    if (!subUserData.email) {
      throw new Error("Email is required")
    }

    // Check if parent user exists
    const parentUser = await User.findById(parentUserId)
    if (!parentUser) {
      throw new Error("Parent user not found")
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: subUserData.username })
    if (existingUsername) {
      throw new Error("Username already exists")
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: subUserData.email })
    if (existingEmail) {
      throw new Error("Email already exists")
    }

    // Create sub-user data
    const newSubUserData = {
      ...subUserData,
      role: "user", // Using 'user' as the role
      parentUser: parentUserId, // Set the parent user reference
    }

    console.log("Creating sub-user with data:", newSubUserData)

    // Create the sub-user
    const subUser = await User.create(newSubUserData)
    console.log("Sub-user created:", subUser._id)

    return subUser
  },

  /**
   * Get all sub-users for a parent user
   * @param {string} parentUserId - ID of the parent user
   * @returns {Promise<Array>} - Array of sub-users
   */
  async getSubUsers(parentUserId) {
    console.log("Getting sub-users for parent:", parentUserId)

    if (!parentUserId) {
      throw new Error("Parent user ID is required")
    }

    // Find all users where parentUser field equals the parentUserId
    const query = { parentUser: parentUserId }
    console.log("Query for sub-users:", query)

    const subUsers = await User.find(query).select("-password")
    console.log(`Found ${subUsers.length} sub-users for parent ${parentUserId}`)

    return subUsers
  },

  /**
   * Get a sub-user by ID
   * @param {string} subUserId - ID of the sub-user
   * @returns {Promise<Object>} - The sub-user
   */
  async getSubUserById(subUserId) {
    console.log("Getting sub-user by ID:", subUserId)

    if (!subUserId) {
      throw new Error("Sub-user ID is required")
    }

    const subUser = await User.findById(subUserId).select("-password")

    if (!subUser) {
      throw new Error("Sub-user not found")
    }

    return subUser
  },

  /**
   * Update a sub-user
   * @param {string} subUserId - ID of the sub-user
   * @param {Object} userData - Updated data for the sub-user
   * @returns {Promise<Object>} - The updated sub-user
   */
  async updateSubUser(subUserId, userData) {
    console.log("Updating sub-user:", subUserId)

    if (!subUserId) {
      throw new Error("Sub-user ID is required")
    }

    if (!userData) {
      throw new Error("User data is required")
    }

    // If updating password, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10)
      userData.password = await bcrypt.hash(userData.password, salt)
    }

    const updatedUser = await User.findByIdAndUpdate(subUserId, userData, { new: true }).select("-password")

    if (!updatedUser) {
      throw new Error("Sub-user not found")
    }

    return updatedUser
  },

  /**
   * Delete a sub-user
   * @param {string} parentUserId - ID of the parent user
   * @param {string} subUserId - ID of the sub-user to delete
   * @returns {Promise<Object>} - Success message
   */
  async deleteSubUser(parentUserId, subUserId) {
    console.log("Deleting sub-user:", subUserId, "for parent:", parentUserId)

    if (!parentUserId) {
      throw new Error("Parent user ID is required")
    }

    if (!subUserId) {
      throw new Error("Sub-user ID is required")
    }

    // Get the sub-user
    const subUser = await User.findById(subUserId)

    if (!subUser) {
      throw new Error("Sub-user not found")
    }

    // Check if the sub-user belongs to the parent user
    if (!subUser.parentUser || subUser.parentUser.toString() !== parentUserId.toString()) {
      throw new Error("Not authorized to delete this sub-user")
    }

    // Delete the sub-user
    await User.findByIdAndDelete(subUserId)

    return { message: "Sub-user deleted successfully" }
  },

  /**
   * Verify if a user is a sub-user of a parent
   * @param {string} parentUserId - ID of the parent user
   * @param {string} subUserId - ID of the sub-user
   * @returns {Promise<boolean>} - True if the user is a sub-user of the parent
   */
  async verifySubUserBelongsToParent(parentUserId, subUserId) {
    const subUser = await User.findById(subUserId)

    if (!subUser) {
      return false
    }

    return subUser.parentUser && subUser.parentUser.toString() === parentUserId.toString()
  },
}

module.exports = subUserService

