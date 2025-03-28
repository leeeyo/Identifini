const analyticsService = require("../services/analyticsService")
const cardService = require("../services/cardService")

class AnalyticsController {
  /**
   * Record a card view
   * @route POST /api/analytics/cards/:cardId/view
   */
  async recordCardView(req, res) {
    try {
      const { cardId } = req.params

      // Get view data from request
      const viewData = {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        referrer: req.headers.referer || req.headers.referrer || "",
      }

      // Record the view
      await analyticsService.recordCardView(cardId, viewData)

      res.status(200).json({
        success: true,
        message: "Card view recorded",
      })
    } catch (error) {
      console.error("Error in recordCardView:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Record a card interaction
   * @route POST /api/analytics/cards/:cardId/interaction
   */
  async recordCardInteraction(req, res) {
    try {
      const { cardId } = req.params
      const { interactionType, interactionData } = req.body

      if (!interactionType) {
        return res.status(400).json({
          success: false,
          error: "Interaction type is required",
        })
      }

      // Record the interaction
      await analyticsService.recordCardInteraction(cardId, interactionType, interactionData)

      res.status(200).json({
        success: true,
        message: "Card interaction recorded",
      })
    } catch (error) {
      console.error("Error in recordCardInteraction:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Get analytics for a card
   * @route GET /api/analytics/cards/:cardId
   */
  async getCardAnalytics(req, res) {
    try {
      const { cardId } = req.params
      const { start, end } = req.query

      // Check if the card belongs to the authenticated user
      const card = await cardService.getCardDetails(cardId)

      if (card.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to access analytics for this card",
        })
      }

      // Get analytics
      const analytics = await analyticsService.getCardAnalytics(cardId, { start, end })

      res.status(200).json({
        success: true,
        data: analytics,
      })
    } catch (error) {
      console.error("Error in getCardAnalytics:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Get view statistics for a card
   * @route GET /api/analytics/cards/:cardId/views
   */
  async getCardViewStats(req, res) {
    try {
      const { cardId } = req.params
      const { start, end } = req.query

      // Check if the card belongs to the authenticated user
      const card = await cardService.getCardDetails(cardId)

      if (card.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to access view statistics for this card",
        })
      }

      // Get view statistics
      const viewStats = await analyticsService.getCardViewStats(cardId, { start, end })

      res.status(200).json({
        success: true,
        data: viewStats,
      })
    } catch (error) {
      console.error("Error in getCardViewStats:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Get interaction statistics for a card
   * @route GET /api/analytics/cards/:cardId/interactions
   */
  async getCardInteractionStats(req, res) {
    try {
      const { cardId } = req.params
      const { start, end } = req.query

      // Check if the card belongs to the authenticated user
      const card = await cardService.getCardDetails(cardId)

      if (card.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to access interaction statistics for this card",
        })
      }

      // Get interaction statistics
      const interactionStats = await analyticsService.getCardInteractionStats(cardId, { start, end })

      res.status(200).json({
        success: true,
        data: interactionStats,
      })
    } catch (error) {
      console.error("Error in getCardInteractionStats:", error)
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }
}

module.exports = new AnalyticsController()

