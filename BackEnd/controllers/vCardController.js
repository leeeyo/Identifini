// vCardController.js
const cardRepository = require("../repositories/cardRepository")

class VCardController {
  // Generate a vCard for a card by username
  async generateVCard(req, res) {
    try {
      const { username } = req.params
      if (!username) {
        return res.status(400).json({ error: "Card username not provided" })
      }

      // Fetch the card record
      const card = await cardRepository.getByUsername(username)
      if (!card) {
        return res.status(404).json({ error: "Card not found" })
      }

      // Prepare basic vCard fields
      const displayName = card.display_name
      const nField = displayName + ";;;;" // Using display name only for simplicity
      const fnField = displayName

      // Process profile picture if available
      let photoField = ""
      if (card.card_pic && card.card_pic.startsWith("data:image")) {
        // Extract base64 data from data URL
        const base64Data = card.card_pic.split(",")[1]
        photoField = "PHOTO;ENCODING=b;TYPE=JPEG:" + base64Data + "\r\n"
      }

      // Process telephone and email information from floating actions
      const telLines = []
      const emailLines = []

      let floatingActions = []
      if (card.floating_actions) {
        if (typeof card.floating_actions === "string") {
          try {
            floatingActions = JSON.parse(card.floating_actions)
          } catch (e) {
            console.error("Error parsing floating actions:", e)
          }
        } else if (Array.isArray(card.floating_actions)) {
          floatingActions = card.floating_actions
        }
      }

      if (floatingActions.length > 0) {
        floatingActions.forEach((action) => {
          const type = action.type || ""
          const url = action.url || ""

          if (type === "Call") {
            // Extract phone number from tel: URL if needed
            const phone = url.startsWith("tel:") ? url.substring(4) : url
            telLines.push("TEL;TYPE=voice,HOME:" + phone)
          } else if (type === "WhatsApp" || type === "Whatsapp") {
            // Extract phone number from WhatsApp URL if needed
            let phone = url
            if (url.startsWith("https://wa.me/")) {
              phone = url.substring(13)
            }
            telLines.push("TEL;TYPE=cell,WhatsApp:" + phone)
          } else if (type === "Email") {
            // Extract email from mailto: URL if needed
            const email = url.startsWith("mailto:") ? url.substring(7) : url
            if (email.includes("@")) {
              emailLines.push("EMAIL:" + email)
            }
          }
        })
      }

      // Add card_email if available and not already added
      if (card.card_email && !emailLines.some((line) => line.includes(card.card_email))) {
        emailLines.push("EMAIL:" + card.card_email)
      }

      // Process address field
      let adrField = ""
      if (card.display_address) {
        // Put entire address into the street component
        adrField = "ADR;TYPE=HOME:;;" + card.display_address.replace(/\n/g, "\\n") + ";;;;\r\n"
      }

      // Build the card URL
      const protocol = req.secure ? "https" : "http"
      const host = req.get("host")
      const cardUrl = `${protocol}://${host}/view-card/${encodeURIComponent(card.card_username)}`
      const urlField = "URL:" + cardUrl + "\r\n"

      // Prepare a NOTE field that includes the bio
      let noteField = ""
      if (card.bio) {
        noteField = "NOTE:" + card.bio.replace(/\n/g, "\\n") + "\r\n"
      }

      // Build the vCard content (v3.0)
      let vcf = "BEGIN:VCARD\r\n"
      vcf += "VERSION:3.0\r\n"
      vcf += "FN:" + fnField + "\r\n"
      vcf += "N:" + nField + "\r\n"
      vcf += photoField

      telLines.forEach((tel) => {
        vcf += tel + "\r\n"
      })

      emailLines.forEach((email) => {
        vcf += email + "\r\n"
      })

      if (adrField) {
        vcf += adrField
      }

      vcf += urlField
      vcf += noteField
      vcf += "END:VCARD\r\n"

      // Set headers to force download of the vCard file
      const filename = encodeURIComponent(displayName) + ".vcf"
      res.setHeader("Content-Type", "text/vcard; charset=utf-8")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
      res.send(vcf)
    } catch (error) {
      console.error("Error generating vCard:", error)
      res.status(500).json({ error: "Failed to generate vCard" })
    }
  }
}

module.exports = new VCardController()

