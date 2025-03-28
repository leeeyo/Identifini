const emailService = require("../services/emailService")
const cardService = require("../services/cardService")
const userService = require("../services/userService")

class EmailController {
  /**
   * Share a card via email
   * @route POST /api/email/share-card/:cardId
   */
  async shareCardViaEmail(req, res) {
    try {
      const { cardId } = req.params
      const { recipientEmail, message } = req.body

      if (!recipientEmail) {
        return res.status(400).json({
          success: false,
          message: "Recipient email is required",
        })
      }

      // Verify card ownership
      const card = await cardService.getCardDetails(cardId)

      if (card.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to share this card",
        })
      }

      // Add custom message to card if provided
      if (message) {
        card.tagline = message
      }

      // Send email
      await emailService.sendCardSharedEmail(req.user, card, recipientEmail)

      res.status(200).json({
        success: true,
        message: "Card shared successfully",
      })
    } catch (error) {
      console.error("Error sharing card via email:", error)
      res.status(500).json({
        success: false,
        message: "Failed to share card",
        error: error.message,
      })
    }
  }

  /**
   * Send a test email
   * @route POST /api/email/test
   */
  async sendTestEmail(req, res) {
    try {
      const { emailType } = req.body

      if (!emailType) {
        return res.status(400).json({
          success: false,
          message: "Email type is required",
        })
      }

      // Get user
      const user = await userService.getUserById(req.user._id)

      if (!user.email) {
        return res.status(400).json({
          success: false,
          message: "User does not have an email address",
        })
      }

      let result

      switch (emailType) {
        case "welcome":
          result = await emailService.sendWelcomeEmail(user)
          break
        case "password-reset":
          // Generate a dummy token
          const resetToken = "test-reset-token"
          result = await emailService.sendPasswordResetEmail(user, resetToken)
          break
        case "card-view-notification":
          // Get user's first card
          const cards = await cardService.getAllCards(user._id)

          if (cards.length === 0) {
            return res.status(400).json({
              success: false,
              message: "User does not have any cards",
            })
          }

          result = await emailService.sendCardViewNotification(user, cards[0], 10)
          break
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid email type",
          })
      }

      res.status(200).json({
        success: true,
        message: "Test email sent successfully",
        data: result,
      })
    } catch (error) {
      console.error("Error sending test email:", error)
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
        error: error.message,
      })
    }
  }
}

module.exports = new EmailController()

