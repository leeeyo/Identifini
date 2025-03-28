const express = require("express")
const router = express.Router()
const analyticsController = require("../controllers/analyticsController")
const { protect } = require("../middleware/authMiddleware")

// Public routes for recording views and interactions
router.post("/cards/:cardId/view", analyticsController.recordCardView)
router.post("/cards/:cardId/interaction", analyticsController.recordCardInteraction)

// Protected routes for getting analytics
router.use(protect)
router.get("/cards/:cardId", analyticsController.getCardAnalytics)
router.get("/cards/:cardId/views", analyticsController.getCardViewStats)
router.get("/cards/:cardId/interactions", analyticsController.getCardInteractionStats)

module.exports = router

