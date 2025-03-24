const cardService = require("../services/cardService")

class CardController {
  // Create a card
  async createCard(req, res) {
    try {
      const newCard = await cardService.createCard(req.body)
      res.status(201).json(newCard)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }

  // Fetch all cards
  async fetchAllCards(req, res) {
    try {
      const cards = await cardService.getAllCards()
      res.json(cards)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // Fetch a card by username
  async fetchCardByUsername(req, res) {
    try {
      const card = await cardService.getCardByUsername(req.params.username)
      res.json(card)
    } catch (error) {
      res.status(404).json({ error: error.message })
    }
  }

  // View a card by ID
  async fetchCard(req, res) {
    try {
      const card = await cardService.getCardDetails(req.params.id)
      res.json(card)
    } catch (error) {
      res.status(404).json({ error: error.message })
    }
  }

  // Edit a card
  async updateCard(req, res) {
    try {
      const updatedCard = await cardService.updateCard(req.params.id, req.body)
      res.json(updatedCard)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }

  // Delete a card
  async deleteCard(req, res) {
    try {
      await cardService.deleteCard(req.params.id)
      res.status(204).send()
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }

  // Duplicate a card
  async duplicateCard(req, res) {
    try {
      const duplicatedCard = await cardService.duplicateCard(req.params.id)
      res.status(201).json(duplicatedCard)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }

  // Transfer a card
  async transferCard(req, res) {
    try {
      const { newOwnerId } = req.body
      if (!newOwnerId) {
        return res.status(400).json({ error: "New owner ID is required" })
      }

      const transferredCard = await cardService.transferCard(req.params.id, newOwnerId)
      res.json(transferredCard)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }
}

module.exports = new CardController()

