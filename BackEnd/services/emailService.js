const nodemailer = require("nodemailer")
const fs = require("fs")
const path = require("path")
const handlebars = require("handlebars")

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "false",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Load email templates
    this.templates = {
      welcome: this.loadTemplate("welcome"),
      passwordReset: this.loadTemplate("password-reset"),
      cardViewNotification: this.loadTemplate("card-view-notification"),
      cardShared: this.loadTemplate("card-shared"),
    }
  }

  /**
   * Load an email template
   * @param {string} templateName - Name of the template
   * @returns {Function} - Compiled Handlebars template
   */
  loadTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, `../templates/emails/${templateName}.html`)
      const templateSource = fs.readFileSync(templatePath, "utf8")
      return handlebars.compile(templateSource)
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error)
      // Return a simple template as fallback
      return handlebars.compile(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">{{title}}</h1>
          <p>{{message}}</p>
          <p>Best regards,<br>The Identifini Team</p>
        </div>
      `)
    }
  }

  /**
   * Send an email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Email send result
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }

      if (options.attachments) {
        mailOptions.attachments = options.attachments
      }

      return await this.transporter.sendMail(mailOptions)
    } catch (error) {
      console.error("Error sending email:", error)
      throw error
    }
  }

  /**
   * Send a welcome email to a new user
   * @param {Object} user - User object
   * @returns {Promise<Object>} - Email send result
   */
  async sendWelcomeEmail(user) {
    try {
      const html = this.templates.welcome({
        name: user.name || user.username,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      })

      return await this.sendEmail({
        to: user.email,
        subject: "Welcome to Identifini!",
        html,
      })
    } catch (error) {
      console.error("Error sending welcome email:", error)
      throw error
    }
  }

  /**
   * Send a password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>} - Email send result
   */
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

      const html = this.templates.passwordReset({
        name: user.name || user.username,
        resetUrl,
      })

      return await this.sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html,
      })
    } catch (error) {
      console.error("Error sending password reset email:", error)
      throw error
    }
  }

  /**
   * Send a card view notification
   * @param {Object} user - User object
   * @param {Object} card - Card object
   * @param {number} viewCount - Number of views
   * @returns {Promise<Object>} - Email send result
   */
  async sendCardViewNotification(user, card, viewCount) {
    try {
      const analyticsUrl = `${process.env.FRONTEND_URL}/cards/${card._id}/analytics`

      const html = this.templates.cardViewNotification({
        name: user.name || user.username,
        cardName: card.display_name,
        viewCount,
        analyticsUrl,
      })

      return await this.sendEmail({
        to: user.email,
        subject: `Your card "${card.display_name}" has ${viewCount} new views!`,
        html,
      })
    } catch (error) {
      console.error("Error sending card view notification:", error)
      throw error
    }
  }

  /**
   * Send a card shared notification
   * @param {Object} user - User object
   * @param {Object} card - Card object
   * @param {string} recipientEmail - Email of the recipient
   * @returns {Promise<Object>} - Email send result
   */
  async sendCardSharedEmail(user, card, recipientEmail) {
    try {
      const cardUrl = `${process.env.FRONTEND_URL}/card/${card._id}`

      const html = this.templates.cardShared({
        senderName: user.name || user.username,
        cardName: card.display_name,
        cardUrl,
        message: card.tagline || "Check out my digital business card!",
      })

      return await this.sendEmail({
        to: recipientEmail,
        subject: `${user.name || user.username} shared a digital business card with you`,
        html,
      })
    } catch (error) {
      console.error("Error sending card shared email:", error)
      throw error
    }
  }
}

module.exports = new EmailService()

