const QRCode = require("qrcode")
const AWS = require("aws-sdk")
const path = require("path")
const fs = require("fs")

class QRCodeService {
  constructor() {
    // Configure AWS S3
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION || "us-east-1",
    })
  }

  /**
   * Generate a QR code for a card
   * @param {string} cardId - ID of the card
   * @param {Object} options - QR code options
   * @returns {Promise<string>} - Data URL of the QR code
   */
  async generateCardQR(cardId, options = {}) {
    try {
      const cardUrl = `${process.env.FRONTEND_URL}/card/${cardId}`

      const qrOptions = {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.92,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        ...options,
      }

      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(cardUrl, qrOptions)
      return dataUrl
    } catch (error) {
      console.error("Error generating QR code:", error)
      throw error
    }
  }

  /**
   * Generate a QR code and save it to S3
   * @param {string} cardId - ID of the card
   * @param {Object} options - QR code options
   * @returns {Promise<string>} - URL of the saved QR code
   */
  async generateAndSaveCardQR(cardId, options = {}) {
    try {
      const cardUrl = `${process.env.FRONTEND_URL}/card/${cardId}`

      const qrOptions = {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.92,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        ...options,
      }

      // Create temporary directory if it doesn't exist
      const tempDir = path.join(__dirname, "../temp")
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      // Generate QR code and save to temp file
      const tempFilePath = path.join(tempDir, `qr-${cardId}.png`)
      await QRCode.toFile(tempFilePath, cardUrl, qrOptions)

      // Upload to S3
      const fileContent = fs.readFileSync(tempFilePath)

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `qrcodes/${cardId}.png`,
        Body: fileContent,
        ContentType: "image/png",
        ACL: "public-read",
      }

      const result = await this.s3.upload(params).promise()

      // Delete temp file
      fs.unlinkSync(tempFilePath)

      return result.Location
    } catch (error) {
      console.error("Error generating and saving QR code:", error)
      throw error
    }
  }

  /**
   * Generate a QR code with custom content
   * @param {string} content - Content for the QR code
   * @param {Object} options - QR code options
   * @returns {Promise<string>} - Data URL of the QR code
   */
  async generateCustomQR(content, options = {}) {
    try {
      const qrOptions = {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.92,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        ...options,
      }

      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(content, qrOptions)
      return dataUrl
    } catch (error) {
      console.error("Error generating custom QR code:", error)
      throw error
    }
  }
}

module.exports = new QRCodeService()

