const cardRepository = require("../repositories/cardRepository")
const userService = require("./userService")

class CardService {
  // Create a new card
  async createCard(cardData) {
    if (!cardData) throw new Error("Card data is required")
    
    // Set default package type if not provided
    if (!cardData.package_type) {
      cardData.package_type = "individual"
    }
    
    // Validate package type
    if (!["individual", "restaurant", "enterprise"].includes(cardData.package_type)) {
      throw new Error("Invalid package type. Must be individual, restaurant, or enterprise")
    }
    
    return await cardRepository.create(cardData)
  }

  // Get all cards
  async getAllCards(userId = null, packageType = null) {
    let filters = {}
    
    if (userId) {
      filters.user = userId
    }
    
    if (packageType) {
      // Validate package type
      if (!["individual", "restaurant", "enterprise"].includes(packageType)) {
        throw new Error("Invalid package type. Must be individual, restaurant, or enterprise")
      }
      filters.package_type = packageType
    }
    
    const cards = await cardRepository.getAll(filters)
    return { cards, total: cards.length }
  }

  // Get card by username
  async getCardByUsername(username) {
    const card = await cardRepository.getByUsername(username)
    if (!card) {
      throw new Error("Card not found")
    }
    
    // If it's a restaurant card with a menu, populate the menu
    if (card.package_type === "restaurant" && card.restaurant_details?.menu) {
      return await cardRepository.getByUsernameWithMenu(username)
    }
    
    return card
  }

  // Get card details by ID
  async getCardDetails(id) {
    const card = await cardRepository.getById(id)
    if (!card) throw new Error("Card not found")
    
    // If it's a restaurant card with a menu, populate the menu
    if (card.package_type === "restaurant" && card.restaurant_details?.menu) {
      return await cardRepository.getByIdWithMenu(id)
    }
    
    return card
  }

  // Update an existing card
  async updateCard(id, cardData) {
    if (!id) throw new Error("Card ID is required")
    if (!cardData) throw new Error("Card data is required")

    const existingCard = await cardRepository.getById(id)
    if (!existingCard) throw new Error("Card not found")
    
    // Don't allow changing package type through general update
    // This should be done through the dedicated changePackageType method
    if (cardData.package_type && cardData.package_type !== existingCard.package_type) {
      delete cardData.package_type
    }

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

  // Transfer a card to another user
  async transferCard(cardId, fromUserId, toUserId) {
    if (!cardId) throw new Error("Card ID is required")
    if (!fromUserId) throw new Error("Source user ID is required")
    if (!toUserId) throw new Error("Destination user ID is required")

    // Get the card
    const card = await cardRepository.getById(cardId)
    if (!card) throw new Error("Card not found")

    // Check if the card belongs to the source user
    if (card.user._id.toString() !== fromUserId.toString()) {
      throw new Error("Not authorized to transfer this card")
    }

    // Get the destination user
    const toUser = await userService.getUserById(toUserId)
    if (!toUser) throw new Error("Destination user not found")

    // Update the card's user
    return await cardRepository.update(cardId, { user: toUserId })
  }

  // Get all cards for a user and their sub-users
  async getAllCardsForUserAndSubUsers(userId, packageType = null) {
    if (!userId) throw new Error("User ID is required")

    // Get the user with populated sub-users
    const user = await userService.getUserById(userId)
    if (!user) throw new Error("User not found")

    // Get all cards for the user
    const userCards = await this.getAllCards(userId, packageType)

    // If the user has no sub-users, return just their cards
    if (!user.subUsers || user.subUsers.length === 0) {
      return userCards
    }

    // Get all sub-user IDs
    const subUserIds = user.subUsers.map((subUser) => subUser._id)

    // Get all cards for the sub-users
    const subUserCards = await Promise.all(
      subUserIds.map(async (subUserId) => {
        const cards = await this.getAllCards(subUserId, packageType)
        return cards.cards
      }),
    )

    // Flatten the array of sub-user cards
    const allSubUserCards = subUserCards.flat()

    // Combine the user's cards with the sub-users' cards
    const allCards = [...userCards.cards, ...allSubUserCards]

    return { cards: allCards, total: allCards.length }
  }
  
  // Change package type
  async changePackageType(id, packageType) {
    if (!id) throw new Error("Card ID is required")
    if (!packageType) throw new Error("Package type is required")
    
    // Validate package type
    if (!["individual", "restaurant", "enterprise"].includes(packageType)) {
      throw new Error("Invalid package type. Must be individual, restaurant, or enterprise")
    }
    
    const existingCard = await cardRepository.getById(id)
    if (!existingCard) throw new Error("Card not found")
    
    // If package type is not changing, return the existing card
    if (existingCard.package_type === packageType) {
      return existingCard
    }
    
    // Update the package type
    return await cardRepository.update(id, { 
      package_type: packageType,
      // Reset package-specific details when changing package type
      individual_details: packageType === "individual" ? existingCard.individual_details : undefined,
      restaurant_details: packageType === "restaurant" ? existingCard.restaurant_details : undefined,
      enterprise_details: packageType === "enterprise" ? existingCard.enterprise_details : undefined
    })
  }
  
  // Update package-specific details
  async updatePackageDetails(id, packageDetails) {
    if (!id) throw new Error("Card ID is required")
    if (!packageDetails) throw new Error("Package details are required")
    
    const existingCard = await cardRepository.getById(id)
    if (!existingCard) throw new Error("Card not found")
    
    // Determine which package details to update based on the card's package type
    const updateData = {}
    
    if (existingCard.package_type === "individual" && packageDetails.individual_details) {
      updateData.individual_details = packageDetails.individual_details
    } else if (existingCard.package_type === "restaurant" && packageDetails.restaurant_details) {
      updateData.restaurant_details = packageDetails.restaurant_details
    } else if (existingCard.package_type === "enterprise" && packageDetails.enterprise_details) {
      updateData.enterprise_details = packageDetails.enterprise_details
    } else {
      throw new Error(`Details must be provided for the current package type: ${existingCard.package_type}`)
    }
    
    return await cardRepository.update(id, updateData)
  }
  
  // Link menu to restaurant card
  async linkMenuToRestaurantCard(cardId, menuId) {
    if (!cardId) throw new Error("Card ID is required")
    if (!menuId) throw new Error("Menu ID is required")
    
    const card = await cardRepository.getById(cardId)
    if (!card) throw new Error("Card not found")
    
    // Check if card is a restaurant type
    if (card.package_type !== "restaurant") {
      throw new Error("Menu can only be linked to restaurant cards")
    }
    
    // Update restaurant details with menu reference
    const restaurantDetails = card.restaurant_details || {}
    restaurantDetails.menu = menuId
    
    return await cardRepository.update(cardId, { 
      restaurant_details: restaurantDetails 
    })
  }
  
  // Get cards by package type
  async getCardsByPackageType(userId, packageType) {
    if (!packageType) throw new Error("Package type is required")
    
    // Validate package type
    if (!["individual", "restaurant", "enterprise"].includes(packageType)) {
      throw new Error("Invalid package type. Must be individual, restaurant, or enterprise")
    }
    
    return await this.getAllCards(userId, packageType)
  }
}

module.exports = new CardService()