const express = require("express")
const router = express.Router()
const qrCodeController = require("../controllers/qrCodeController")
const { protect } = require("../middleware/authMiddleware")

// Apply authentication middleware to all routes
router.use(protect)

// Generate QR code for a card
router.get("/card/:cardId", qrCodeController.generateCardQR)

// Generate and save QR code for a card
router.post("/card/:cardId", qrCodeController.generateAndSaveCardQR)

// Generate custom QR code
router.post("/custom", qrCodeController.generateCustomQR)

module.exports = router

