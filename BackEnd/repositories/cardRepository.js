const Card = require("../models/Card")

class CardRepository {
  // Create a new card
  async create(cardData) {
    const newCard = new Card(cardData)
    return await newCard.save()
  }

  // Get a card by ID
  async getById(id) {
    return await Card.findById(id).populate("user")
  }

  // Get a card by username
  async getByUsername(username) {
    return await Card.findOne({ card_username: username }).populate("user")
  }

  // Update a card
  async update(id, cardData) {
    return await Card.findByIdAndUpdate(id, cardData, { new: true, runValidators: true }).populate("user")
  }

  // Delete a card
  async delete(id) {
    return await Card.findByIdAndDelete(id)
  }

  // Get all cards (useful for listing)
  async getAll(filters = {}) {
    return await Card.find(filters).populate("user")
  }

  // Get cards by owner ID
  async getByOwnerId(ownerId) {
    return await Card.find({ ownerId }).populate("user")
  }

  // Add this method to your existing cardRepository.js file
  async getByIdAndUserId(cardId, userId) {
    return await Card.findOne({ _id: cardId, user: userId })
  }
}

module.exports = new CardRepository()

