const cardRepository = require("../repositories/cardRepository")

class CardService {
  // Create a new card
  async createCard(cardData) {
    if (!cardData) throw new Error("Card data is required")
    return await cardRepository.create(cardData)
  }

  // Get all cards
  async getAllCards() {
    const cards = await cardRepository.getAll()
    return { cards, total: cards.length }
  }

  // Get card by username
  async getCardByUsername(username) {
    const card = await cardRepository.getByUsername(username)
    if (!card) {
      throw new Error("Card not found")
    }
    return card
  }

  // Get card details by ID
  async getCardDetails(id) {
    const card = await cardRepository.getById(id)
    if (!card) throw new Error("Card not found")
    return card
  }

  // Update an existing card
  async updateCard(id, cardData) {
    if (!id) throw new Error("Card ID is required")
    if (!cardData) throw new Error("Card data is required")

    const existingCard = await cardRepository.getById(id)
    if (!existingCard) throw new Error("Card not found")

    return await cardRepository.update(id, cardData)
  }

  // Delete a card
  async deleteCard(id) {
    if (!id) throw new Error("Card ID is required")

    const existingCard = await cardRepository.getById(id)
    if (!existingCard) throw new Error("Card not found")

    return await cardRepository.delete(id)
  }

  // Duplicate a card
  async duplicateCard(id) {
    if (!id) throw new Error("Card ID is required")

    const existingCard = await cardRepository.getById(id)
    if (!existingCard) throw new Error("Card not found")

    // Create a copy of the card without the ID
    const cardData = existingCard.toObject()
    delete cardData._id

    // Modify the username to make it unique
    cardData.card_username = `${cardData.card_username}-copy-${Date.now().toString().slice(-6)}`
    cardData.display_name = `${cardData.display_name || "Card"} (Copy)`

    return await cardRepository.create(cardData)
  }

  // Transfer a card to a new owner
  async transferCard(id, newOwnerId) {
    if (!id) throw new Error("Card ID is required")
    if (!newOwnerId) throw new Error("New owner ID is required")

    const existingCard = await cardRepository.getById(id)
    if (!existingCard) throw new Error("Card not found")

    // Update the owner field
    return await cardRepository.update(id, { user: newOwnerId })
  }
}

module.exports = new CardService()

