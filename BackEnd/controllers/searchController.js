const searchService = require("../services/searchService")

class SearchController {
  /**
   * Search for cards
   * @route GET /api/search/cards
   */
  async searchCards(req, res) {
    try {
      const { page = 1, limit = 10, ...searchParams } = req.query

      // Get the user ID from the authenticated user
      const userId = req.user._id

      // Search for cards
      const results = await searchService.searchCards(searchParams, userId, page, limit)

      res.status(200).json({
        success: true,
        ...results,
      })
    } catch (error) {
      console.error("Error in searchCards:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Search for users (admin only)
   * @route GET /api/search/users
   */
  async searchUsers(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Not authorized to search users",
        })
      }

      const { page = 1, limit = 10, ...searchParams } = req.query

      // Search for users
      const results = await searchService.searchUsers(searchParams, page, limit)

      res.status(200).json({
        success: true,
        ...results,
      })
    } catch (error) {
      console.error("Error in searchUsers:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Search for menus
   * @route GET /api/search/menus
   */
  async searchMenus(req, res) {
    try {
      const { page = 1, limit = 10, ...searchParams } = req.query

      // Get the user ID from the authenticated user
      const userId = req.user._id

      // Search for menus
      const results = await searchService.searchMenus(searchParams, userId, page, limit)

      res.status(200).json({
        success: true,
        ...results,
      })
    } catch (error) {
      console.error("Error in searchMenus:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }
}

module.exports = new SearchController()

