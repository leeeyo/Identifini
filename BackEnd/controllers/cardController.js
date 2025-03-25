const cardService = require("../services/cardService")

class CardController {
  // Fetch all cards for the authenticated user
  async fetchAllCards(req, res) {
    try {
      console.log("fetchAllCards called for user:", req.user._id)

      // Get all cards for the current user
      const result = await cardService.getAllCards(req.user._id)
      return res.json(result)
    } catch (error) {
      console.error("Error in fetchAllCards:", error)
      res.status(500).json({ error: error.message })
    }
  }

  // Fetch a card by ID (only if it belongs to the authenticated user)
  async fetchCard(req, res) {
    try {
      const card = await cardService.getCardDetails(req.params.id)

      // Check if the card belongs to the authenticated user
      if (card.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized to access this card" })
      }

      return res.json(card)
    } catch (error) {
      console.error("Error in fetchCard:", error)
      res.status(404).json({ error: error.message })
    }
  }

  // Fetch a card by username (only if it belongs to the authenticated user)
  async fetchCardByUsername(req, res) {
    try {
      const card = await cardService.getCardByUsername(req.params.username)

      // Check if the card belongs to the authenticated user
      if (card.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized to access this card" })
      }

      return res.json(card)
    } catch (error) {
      console.error("Error in fetchCardByUsername:", error)
      res.status(404).json({ error: error.message })
    }
  }

  // Create a card for the authenticated user
  async createCard(req, res) {
    try {
      console.log("Create card data:", req.body)

      // Add the user ID to the card data
      const cardData = {
        ...req.body,
        user: req.user._id,
      }

      const newCard = await cardService.createCard(cardData)
      return res.status(201).json(newCard)
    } catch (error) {
      console.error("Error in createCard:", error)
      res.status(400).json({ error: error.message })
    }
  }

  // Update a card (only if it belongs to the authenticated user)
  async updateCard(req, res) {
    try {
      console.log("Update card:", req.params.id, req.body)

      // First, check if the card belongs to the user
      const existingCard = await cardService.getCardDetails(req.params.id)
      if (existingCard.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized to update this card" })
      }

      const updatedCard = await cardService.updateCard(req.params.id, req.body)
      return res.json(updatedCard)
    } catch (error) {
      console.error("Error in updateCard:", error)
      res.status(400).json({ error: error.message })
    }
  }

  // Delete a card (only if it belongs to the authenticated user)
  async deleteCard(req, res) {
    try {
      console.log("Delete card:", req.params.id)

      // First, check if the card belongs to the user
      const existingCard = await cardService.getCardDetails(req.params.id)
      if (existingCard.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized to delete this card" })
      }

      await cardService.deleteCard(req.params.id)
      return res.status(204).send()
    } catch (error) {
      console.error("Error in deleteCard:", error)
      res.status(400).json({ error: error.message })
    }
  }

  // Duplicate a card (only if it belongs to the authenticated user)
  async duplicateCard(req, res) {
    try {
      console.log("Duplicate card:", req.params.id)

      // First, check if the card belongs to the user
      const existingCard = await cardService.getCardDetails(req.params.id)
      if (existingCard.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized to duplicate this card" })
      }

      const duplicatedCard = await cardService.duplicateCard(req.params.id)
      return res.status(201).json(duplicatedCard)
    } catch (error) {
      console.error("Error in duplicateCard:", error)
      res.status(400).json({ error: error.message })
    }
  }
}

// Make sure we're exporting the controller correctly
module.exports = new CardController()

