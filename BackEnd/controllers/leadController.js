const Lead = require("../models/Lead")
const Card = require("../models/Card")

class LeadController {
  // Get all leads for a card
  async getLeadsByCardUsername(req, res) {
    try {
      const { username } = req.params

      // Find the card first
      const card = await Card.findOne({ card_username: username })
      if (!card) {
        return res.status(404).json({ error: "Card not found" })
      }

      // Check if the user is authorized to view these leads
      if (card.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized to access these leads" })
      }

      // Get the leads
      const leads = await Lead.find({ cardUsername: username }).sort({ createdAt: -1 })

      res.json(leads)
    } catch (error) {
      console.error("Error in getLeadsByCardUsername:", error)
      res.status(500).json({ error: "Server error" })
    }
  }

  // Submit a new lead
  async submitLead(req, res) {
    try {
      const { username } = req.params
      const leadData = req.body

      // Find the card first
      const card = await Card.findOne({ card_username: username })
      if (!card) {
        return res.status(404).json({ error: "Card not found" })
      }

      // Create the lead
      const lead = new Lead({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        notes: leadData.notes,
        cardUsername: username,
        cardId: card._id,
      })

      await lead.save()

      res.status(201).json(lead)
    } catch (error) {
      console.error("Error in submitLead:", error)
      res.status(500).json({ error: "Server error" })
    }
  }

  // Delete a lead
  async deleteLead(req, res) {
    try {
      const { username, leadId } = req.params

      // Find the card first
      const card = await Card.findOne({ card_username: username })
      if (!card) {
        return res.status(404).json({ error: "Card not found" })
      }

      // Check if the user is authorized to delete this lead
      if (card.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized to delete this lead" })
      }

      // Find and delete the lead
      const lead = await Lead.findById(leadId)
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" })
      }

      if (lead.cardUsername !== username) {
        return res.status(400).json({ error: "Lead does not belong to this card" })
      }

      await Lead.findByIdAndDelete(leadId)

      res.status(204).send()
    } catch (error) {
      console.error("Error in deleteLead:", error)
      res.status(500).json({ error: "Server error" })
    }
  }
}

module.exports = new LeadController()

