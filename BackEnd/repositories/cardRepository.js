const Card = require("../models/Card");

class CardRepository {
  // Create a new card
  async create(cardData) {
    const newCard = new Card(cardData);
    return await newCard.save();
  }
  
  // Get a card by ID
  async getById(id) {
    return await Card.findById(id).populate("user");
  }
  
  // Get a card by ID with menu populated (for restaurant package)
  async getByIdWithMenu(id) {
    return await Card.findById(id)
      .populate("user")
      .populate("restaurant_details.menu");
  }
  
  // Get a card by username
  async getByUsername(username) {
    return await Card.findOne({ card_username: username }).populate("user");
  }
  
  // Get a card by username with menu populated (for restaurant package)
  async getByUsernameWithMenu(username) {
    return await Card.findOne({ card_username: username })
      .populate("user")
      .populate("restaurant_details.menu");
  }
  
  // Update a card
  async update(id, cardData) {
    return await Card.findByIdAndUpdate(id, cardData, { new: true, runValidators: true }).populate("user");
  }
  
  // Delete a card
  async delete(id) {
    return await Card.findByIdAndDelete(id);
  }
  
  // Get all cards (useful for listing)
  async getAll(filters = {}) {
    return await Card.find(filters).populate("user");
  }
  
  // Get cards by owner ID
  async getByOwnerId(ownerId) {
    return await Card.find({ user: ownerId }).populate("user");
  }
  
  // Get cards by owner ID and package type
  async getByOwnerIdAndPackageType(ownerId, packageType) {
    return await Card.find({ 
      user: ownerId,
      package_type: packageType 
    }).populate("user");
  }
  
  // Get by ID and user ID
  async getByIdAndUserId(cardId, userId) {
    return await Card.findOne({ _id: cardId, user: userId });
  }
  
  // Update package type
  async updatePackageType(id, packageType) {
    return await Card.findByIdAndUpdate(
      id, 
      { package_type: packageType },
      { new: true, runValidators: true }
    ).populate("user");
  }
  
  // Update package-specific details
  async updatePackageDetails(id, packageType, details) {
    const updateField = `${packageType}_details`;
    const updateData = { [updateField]: details };
    
    return await Card.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("user");
  }
}

module.exports = new CardRepository();