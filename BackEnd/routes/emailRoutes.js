const express = require("express")
const router = express.Router()
const emailController = require("../controllers/emailController")
const { protect } = require("../middleware/authMiddleware")

// Apply authentication middleware to all routes
router.use(protect)

// Share a card via email
router.post("/share-card/:cardId", emailController.shareCardViaEmail)

// Send a test email
router.post("/test", emailController.sendTestEmail)

module.exports = router

