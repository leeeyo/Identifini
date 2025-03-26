const subUserService = require("../services/subUserService")

/**
 * Controller for managing sub-users
 */
const subUserController = {
  /**
   * Create a new sub-user
   * @route POST /api/sub-users
   */
  async createSubUser(req, res) {
    try {
      console.log("createSubUser called with data:", req.body)

      // Validate required fields
      const { username, password, email, name } = req.body

      if (!username || !password || !email) {
        return res.status(400).json({
          success: false,
          error: "Username, password, and email are required",
        })
      }

      // Get the parent user ID from the authenticated user
      const parentUserId = req.user._id
      console.log("Parent user ID:", parentUserId)

      // Create the sub-user
      const subUser = await subUserService.createSubUser(parentUserId, req.body)

      // Return the sub-user data
      res.status(201).json({
        success: true,
        data: {
          _id: subUser._id,
          username: subUser.username,
          name: subUser.name,
          email: subUser.email,
          role: subUser.role,
          parentUser: subUser.parentUser,
          createdAt: subUser.createdAt,
          updatedAt: subUser.updatedAt,
        },
      })
    } catch (error) {
      console.error("Error in createSubUser:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  },

  /**
   * Get all sub-users for the authenticated user
   * @route GET /api/sub-users
   */
  async getSubUsers(req, res) {
    try {
      console.log("getSubUsers called for user:", req.user._id)

      // Get the parent user ID from the authenticated user
      const parentUserId = req.user._id

      // Get all sub-users
      const subUsers = await subUserService.getSubUsers(parentUserId)
      console.log(`Retrieved ${subUsers.length} sub-users`)

      // Return the sub-users
      res.status(200).json({
        success: true,
        count: subUsers.length,
        data: subUsers,
      })
    } catch (error) {
      console.error("Error in getSubUsers:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  },

  /**
   * Get a sub-user by ID
   * @route GET /api/sub-users/:id
   */
  async getSubUser(req, res) {
    try {
      console.log("getSubUser called for id:", req.params.id)

      // Get the parent user ID from the authenticated user
      const parentUserId = req.user._id

      // Get the sub-user ID from the request parameters
      const subUserId = req.params.id

      // Get the sub-user
      const subUser = await subUserService.getSubUserById(subUserId)

      // Check if the sub-user belongs to the parent user
      if (!subUser.parentUser || subUser.parentUser.toString() !== parentUserId.toString()) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to access this sub-user",
        })
      }

      // Return the sub-user
      res.status(200).json({
        success: true,
        data: subUser,
      })
    } catch (error) {
      console.error("Error in getSubUser:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  },

  /**
   * Update a sub-user
   * @route PUT /api/sub-users/:id
   */
  async updateSubUser(req, res) {
    try {
      console.log("updateSubUser called for id:", req.params.id, "with data:", req.body)

      // Get the parent user ID from the authenticated user
      const parentUserId = req.user._id

      // Get the sub-user ID from the request parameters
      const subUserId = req.params.id

      // Verify the sub-user belongs to the parent user
      const isAuthorized = await subUserService.verifySubUserBelongsToParent(parentUserId, subUserId)

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to update this sub-user",
        })
      }

      // Update the sub-user
      const updatedSubUser = await subUserService.updateSubUser(subUserId, req.body)

      // Return the updated sub-user
      res.status(200).json({
        success: true,
        data: updatedSubUser,
      })
    } catch (error) {
      console.error("Error in updateSubUser:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  },

  /**
   * Delete a sub-user
   * @route DELETE /api/sub-users/:id
   */
  async deleteSubUser(req, res) {
    try {
      console.log("deleteSubUser called for id:", req.params.id)

      // Get the parent user ID from the authenticated user
      const parentUserId = req.user._id

      // Get the sub-user ID from the request parameters
      const subUserId = req.params.id

      // Delete the sub-user
      const result = await subUserService.deleteSubUser(parentUserId, subUserId)

      // Return success
      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error("Error in deleteSubUser:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  },

  /**
   * Test route
   * @route GET /api/sub-users/test
   */
  test(req, res) {
    res.json({
      success: true,
      message: "Sub-user routes are working",
    })
  },
}

// Export the controller
module.exports = subUserController

