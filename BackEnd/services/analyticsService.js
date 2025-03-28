const mongoose = require("mongoose")
const CardView = require("../models/CardView")
const CardInteraction = require("../models/CardInteraction")

class AnalyticsService {
  /**
   * Record a card view
   * @param {string} cardId - ID of the card being viewed
   * @param {Object} viewData - Data about the view
   * @returns {Promise<Object>} - The recorded view
   */
  async recordCardView(cardId, viewData = {}) {
    try {
      const cardView = new CardView({
        card: cardId,
        ip: viewData.ip || "0.0.0.0",
        userAgent: viewData.userAgent || "",
        referrer: viewData.referrer || "",
        timestamp: new Date(),
      })

      return await cardView.save()
    } catch (error) {
      console.error("Error recording card view:", error)
      throw error
    }
  }

  /**
   * Record a card interaction (e.g., button click, social media link)
   * @param {string} cardId - ID of the card
   * @param {string} interactionType - Type of interaction
   * @param {Object} interactionData - Additional data about the interaction
   * @returns {Promise<Object>} - The recorded interaction
   */
  async recordCardInteraction(cardId, interactionType, interactionData = {}) {
    try {
      const cardInteraction = new CardInteraction({
        card: cardId,
        interactionType,
        interactionData,
        timestamp: new Date(),
      })

      return await cardInteraction.save()
    } catch (error) {
      console.error("Error recording card interaction:", error)
      throw error
    }
  }

  /**
   * Get view statistics for a card
   * @param {string} cardId - ID of the card
   * @param {Object} timeRange - Time range for the statistics
   * @returns {Promise<Object>} - View statistics
   */
  async getCardViewStats(cardId, timeRange = {}) {
    try {
      const query = { card: cardId }

      // Add time range to query if provided
      if (timeRange.start || timeRange.end) {
        query.timestamp = {}

        if (timeRange.start) {
          query.timestamp.$gte = new Date(timeRange.start)
        }

        if (timeRange.end) {
          query.timestamp.$lte = new Date(timeRange.end)
        }
      }

      // Get total views
      const totalViews = await CardView.countDocuments(query)

      // Get unique views (by IP)
      const uniqueViews = await CardView.aggregate([{ $match: query }, { $group: { _id: "$ip" } }, { $count: "count" }])

      // Get views by day
      const viewsByDay = await CardView.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ])

      // Format views by day for easier consumption
      const formattedViewsByDay = viewsByDay.map((item) => ({
        date: new Date(item._id.year, item._id.month - 1, item._id.day),
        count: item.count,
      }))

      return {
        totalViews,
        uniqueViews: uniqueViews.length > 0 ? uniqueViews[0].count : 0,
        viewsByDay: formattedViewsByDay,
      }
    } catch (error) {
      console.error("Error getting card view stats:", error)
      throw error
    }
  }

  /**
   * Get interaction statistics for a card
   * @param {string} cardId - ID of the card
   * @param {Object} timeRange - Time range for the statistics
   * @returns {Promise<Object>} - Interaction statistics
   */
  async getCardInteractionStats(cardId, timeRange = {}) {
    try {
      const query = { card: cardId }

      // Add time range to query if provided
      if (timeRange.start || timeRange.end) {
        query.timestamp = {}

        if (timeRange.start) {
          query.timestamp.$gte = new Date(timeRange.start)
        }

        if (timeRange.end) {
          query.timestamp.$lte = new Date(timeRange.end)
        }
      }

      // Get total interactions
      const totalInteractions = await CardInteraction.countDocuments(query)

      // Get interactions by type
      const interactionsByType = await CardInteraction.aggregate([
        { $match: query },
        { $group: { _id: "$interactionType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])

      // Get interactions by day
      const interactionsByDay = await CardInteraction.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ])

      // Format interactions by day for easier consumption
      const formattedInteractionsByDay = interactionsByDay.map((item) => ({
        date: new Date(item._id.year, item._id.month - 1, item._id.day),
        count: item.count,
      }))

      return {
        totalInteractions,
        interactionsByType,
        interactionsByDay: formattedInteractionsByDay,
      }
    } catch (error) {
      console.error("Error getting card interaction stats:", error)
      throw error
    }
  }

  /**
   * Get combined analytics for a card
   * @param {string} cardId - ID of the card
   * @param {Object} timeRange - Time range for the statistics
   * @returns {Promise<Object>} - Combined analytics
   */
  async getCardAnalytics(cardId, timeRange = {}) {
    try {
      const viewStats = await this.getCardViewStats(cardId, timeRange)
      const interactionStats = await this.getCardInteractionStats(cardId, timeRange)

      return {
        views: viewStats,
        interactions: interactionStats,
      }
    } catch (error) {
      console.error("Error getting card analytics:", error)
      throw error
    }
  }
}

module.exports = new AnalyticsService()

