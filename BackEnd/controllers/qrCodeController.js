const qrCodeService = require("../services/qrCodeService")
const cardService = require("../services/cardService")

class QRCodeController {
  /**
   * Generate a QR code for a card
   * @route GET /api/qrcodes/card/:cardId
   */
  async generateCardQR(req, res) {
    try {
      const { cardId } = req.params

      // Verify card ownership
      const card = await cardService.getCardDetails(cardId)

      if (card.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to generate QR code for this card",
        })
      }

      // Get QR code options from query params
      const options = {}

      if (req.query.dark) options.color = { ...options.color, dark: req.query.dark }
      if (req.query.light) options.color = { ...options.color, light: req.query.light }
      if (req.query.margin) options.margin = Number.parseInt(req.query.margin)

      // Generate QR code
      const qrCodeDataUrl = await qrCodeService.generateCardQR(cardId, options)

      res.status(200).json({
        success: true,
        data: { qrCode: qrCodeDataUrl },
      })
    } catch (error) {
      console.error("Error generating card QR code:", error)
      res.status(500).json({
        success: false,
        message: "Failed to generate QR code",
        error: error.message,
      })
    }
  }

  /**
   * Generate and save a QR code for a card
   * @route POST /api/qrcodes/card/:cardId
   */
  async generateAndSaveCardQR(req, res) {
    try {
      const { cardId } = req.params

      // Verify card ownership
      const card = await cardService.getCardDetails(cardId)

      if (card.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to generate QR code for this card",
        })
      }

      // Get QR code options from request body
      const options = req.body.options || {}

      // Generate and save QR code
      const qrCodeUrl = await qrCodeService.generateAndSaveCardQR(cardId, options)

      // Update card with QR code URL
      await cardService.updateCard(cardId, { qrCodeUrl })

      res.status(200).json({
        success: true,
        data: { qrCodeUrl },
      })
    } catch (error) {
      console.error("Error generating and saving card QR code:", error)
      res.status(500).json({
        success: false,
        message: "Failed to generate and save QR code",
        error: error.message,
      })
    }
  }

  /**
   * Generate a custom QR code
   * @route POST /api/qrcodes/custom
   */
  async generateCustomQR(req, res) {
    try {
      const { content, options } = req.body

      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Content is required",
        })
      }

      // Generate QR code
      const qrCodeDataUrl = await qrCodeService.generateCustomQR(content, options || {})

      res.status(200).json({
        success: true,
        data: { qrCode: qrCodeDataUrl },
      })
    } catch (error) {
      console.error("Error generating custom QR code:", error)
      res.status(500).json({
        success: false,
        message: "Failed to generate custom QR code",
        error: error.message,
      })
    }
  }
}

module.exports = new QRCodeController()

