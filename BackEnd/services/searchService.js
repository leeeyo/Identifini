const Card = require("../models/Card")
const User = require("../models/User")
const Menu = require("../models/Menu")

class SearchService {
  /**
   * Search for cards based on various criteria
   * @param {Object} searchParams - Search parameters
   * @param {string} userId - ID of the user performing the search
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of results per page
   * @returns {Promise<Object>} - Search results with pagination info
   */
  async searchCards(searchParams, userId, page = 1, limit = 10) {
    try {
      // Convert page and limit to numbers
      page = Number.parseInt(page)
      limit = Number.parseInt(limit)

      // Calculate skip value for pagination
      const skip = (page - 1) * limit

      // Build the query
      const query = this.buildCardSearchQuery(searchParams, userId)

      // Execute the query with pagination
      const cards = await Card.find(query)
        .populate("user", "username name email")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)

      // Get total count for pagination
      const total = await Card.countDocuments(query)

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      return {
        cards,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      }
    } catch (error) {
      console.error("Error in searchCards:", error)
      throw error
    }
  }

  /**
   * Build the search query for cards
   * @param {Object} params - Search parameters
   * @param {string} userId - ID of the user performing the search
   * @returns {Object} - MongoDB query object
   */
  buildCardSearchQuery(params, userId) {
    const query = {}

    // Only return cards owned by the user or their sub-users
    query.user = userId

    // If search term is provided, search across multiple fields
    if (params.term) {
      const searchRegex = new RegExp(params.term, "i")
      query.$or = [
        { card_username: searchRegex },
        { display_name: searchRegex },
        { tagline: searchRegex },
        { bio: searchRegex },
      ]
    }

    // Filter by package type if provided
    if (params.packageType && ["individual", "restaurant", "enterprise"].includes(params.packageType)) {
      query.package_type = params.packageType
    }

    // Filter by creation date range if provided
    if (params.dateFrom || params.dateTo) {
      query.created_at = {}

      if (params.dateFrom) {
        query.created_at.$gte = new Date(params.dateFrom)
      }

      if (params.dateTo) {
        query.created_at.$lte = new Date(params.dateTo)
      }
    }

    return query
  }

  /**
   * Search for users (admin only)
   * @param {Object} searchParams - Search parameters
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of results per page
   * @returns {Promise<Object>} - Search results with pagination info
   */
  async searchUsers(searchParams, page = 1, limit = 10) {
    try {
      // Convert page and limit to numbers
      page = Number.parseInt(page)
      limit = Number.parseInt(limit)

      // Calculate skip value for pagination
      const skip = (page - 1) * limit

      // Build the query
      const query = this.buildUserSearchQuery(searchParams)

      // Execute the query with pagination
      const users = await User.find(query).select("-password").sort({ created_at: -1 }).skip(skip).limit(limit)

      // Get total count for pagination
      const total = await User.countDocuments(query)

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      return {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      }
    } catch (error) {
      console.error("Error in searchUsers:", error)
      throw error
    }
  }

  /**
   * Build the search query for users
   * @param {Object} params - Search parameters
   * @returns {Object} - MongoDB query object
   */
  buildUserSearchQuery(params) {
    const query = {}

    // If search term is provided, search across multiple fields
    if (params.term) {
      const searchRegex = new RegExp(params.term, "i")
      query.$or = [{ username: searchRegex }, { name: searchRegex }, { email: searchRegex }]
    }

    // Filter by role if provided
    if (params.role && ["user", "admin"].includes(params.role)) {
      query.role = params.role
    }

    // Filter by parent user if provided
    if (params.parentUser) {
      query.parentUser = params.parentUser
    }

    return query
  }

  /**
   * Search for menus and menu items
   * @param {Object} searchParams - Search parameters
   * @param {string} userId - ID of the user performing the search
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of results per page
   * @returns {Promise<Object>} - Search results with pagination info
   */
  async searchMenus(searchParams, userId, page = 1, limit = 10) {
    try {
      // Get all cards owned by the user
      const cards = await Card.find({ user: userId }).select("_id")
      const cardIds = cards.map((card) => card._id)

      // Convert page and limit to numbers
      page = Number.parseInt(page)
      limit = Number.parseInt(limit)

      // Calculate skip value for pagination
      const skip = (page - 1) * limit

      // Build the query
      const query = this.buildMenuSearchQuery(searchParams, cardIds)

      // Execute the query with pagination
      const menus = await Menu.find(query)
        .populate("card", "card_username display_name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      // Get total count for pagination
      const total = await Menu.countDocuments(query)

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      return {
        menus,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      }
    } catch (error) {
      console.error("Error in searchMenus:", error)
      throw error
    }
  }

  /**
   * Build the search query for menus
   * @param {Object} params - Search parameters
   * @param {Array} cardIds - Array of card IDs the user has access to
   * @returns {Object} - MongoDB query object
   */
  buildMenuSearchQuery(params, cardIds) {
    const query = {}

    // Only return menus for cards the user has access to
    query.card = { $in: cardIds }

    // If search term is provided, search across multiple fields
    if (params.term) {
      const searchRegex = new RegExp(params.term, "i")
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { "items.name": searchRegex },
        { "items.description": searchRegex },
      ]
    }

    return query
  }
}

module.exports = new SearchService()

