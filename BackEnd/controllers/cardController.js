const cardService = require("../services/cardService")
const userService = require("../services/userService")

class CardController {
  // Fetch all cards for the authenticated user
  async fetchAllCards(req, res) {
    try {
      console.log("fetchAllCards called for user:", req.user._id)

      // Check if package type filter is provided
      const packageType = req.query.packageType

      // Get all cards for the current user
      const result = await cardService.getAllCards(req.user._id, packageType)
      return res.json(result)
    } catch (error) {
      console.error("Error in fetchAllCards:", error)
      res.status(500).json({ error: error.message })
    }
  }

  // Fetch all cards for the authenticated user and their sub-users
  async fetchAllCardsForUserAndSubUsers(req, res) {
    try {
      console.log("fetchAllCardsForUserAndSubUsers called for user:", req.user._id)

      // Check if package type filter is provided
      const packageType = req.query.packageType

      // Get all cards for the current user and their sub-users
      const result = await cardService.getAllCardsForUserAndSubUsers(req.user._id, packageType)
      return res.json(result)
    } catch (error) {
      console.error("Error in fetchAllCardsForUserAndSubUsers:", error)
      res.status(500).json({ error: error.message })
    }
  }

  // Fetch a card by ID (only if it belongs to the authenticated user)
  async fetchCard(req, res) {
    try {
      const card = await cardService.getCardDetails(req.params.id)

      // Check if the card belongs to the authenticated user
      if (card.user._id.toString() !== req.user._id.toString()) {
        // Check if the card belongs to a sub-user of the authenticated user
        const user = await userService.getUserById(req.user._id)
        const isSubUserCard =
          user.subUsers && user.subUsers.some((subUser) => subUser._id.toString() === card.user._id.toString())

        if (!isSubUserCard) {
          return res.status(403).json({ error: "Not authorized to access this card" })
        }
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
        // Check if the card belongs to a sub-user of the authenticated user
        const user = await userService.getUserById(req.user._id)
        const isSubUserCard =
          user.subUsers && user.subUsers.some((subUser) => subUser._id.toString() === card.user._id.toString())

        if (!isSubUserCard) {
          return res.status(403).json({ error: "Not authorized to access this card" })
        }
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
        // Check if the card belongs to a sub-user of the authenticated user
        const user = await userService.getUserById(req.user._id)
        const isSubUserCard =
          user.subUsers && user.subUsers.some((subUser) => subUser._id.toString() === existingCard.user._id.toString())

        if (!isSubUserCard) {
          return res.status(403).json({ error: "Not authorized to update this card" })
        }
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
        // Check if the card belongs to a sub-user of the authenticated user
        const user = await userService.getUserById(req.user._id)
        const isSubUserCard =
          user.subUsers && user.subUsers.some((subUser) => subUser._id.toString() === existingCard.user._id.toString())

        if (!isSubUserCard) {
          return res.status(403).json({ error: "Not authorized to delete this card" })
        }
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
        // Check if the card belongs to a sub-user of the authenticated user
        const user = await userService.getUserById(req.user._id)
        const isSubUserCard =
          user.subUsers && user.subUsers.some((subUser) => subUser._id.toString() === existingCard.user._id.toString())

        if (!isSubUserCard) {
          return res.status(403).json({ error: "Not authorized to duplicate this card" })
        }
      }

      const duplicatedCard = await cardService.duplicateCard(req.params.id)
      return res.status(201).json(duplicatedCard)
    } catch (error) {
      console.error("Error in duplicateCard:", error)
      res.status(400).json({ error: error.message })
    }
  }

  // Transfer a card to another user
  async transferCard(req, res) {
    try {
      console.log("Transfer card:", req.params.id, "to user:", req.body.toUserId)

      // Check if the destination user ID is provided
      if (!req.body.toUserId) {
        return res.status(400).json({ error: "Destination user ID is required" })
      }

      // Transfer the card
      const transferredCard = await cardService.transferCard(req.params.id, req.user._id, req.body.toUserId)

      return res.json(transferredCard)
    } catch (error) {
      console.error("Error in transferCard:", error)
      res.status(400).json({ error: error.message })
    }
  }

  // Change package type
  async changePackageType(req, res) {
    try {
      console.log("Change package type for card:", req.params.id, "to:", req.body.packageType)

      // Check if package type is provided
      if (!req.body.packageType) {
        return res.status(400).json({ error: "Package type is required" })
      }

      // First, check if the card belongs to the user
      const existingCard = await cardService.getCardDetails(req.params.id)
      if (existingCard.user._id.toString() !== req.user._id.toString()) {
        // Check if the card belongs to a sub-user of the authenticated user
        const user = await userService.getUserById(req.user._id)
        const isSubUserCard =
          user.subUsers && user.subUsers.some((subUser) => subUser._id.toString() === existingCard.user._id.toString())

        if (!isSubUserCard) {
          return res.status(403).json({ error: "Not authorized to change package type for this card" })
        }
      }

      const updatedCard = await cardService.changePackageType(req.params.id, req.body.packageType)
      return res.json(updatedCard)
    } catch (error) {
      console.error("Error in changePackageType:", error)
      res.status(400).json({ error: error.message })
    }
  }

  // Update package details
  async updatePackageDetails(req, res) {
    try {
      console.log("Update package details for card:", req.params.id)

      // First, check if the card belongs to the user
      const existingCard = await cardService.getCardDetails(req.params.id)
      if (existingCard.user._id.toString() !== req.user._id.toString()) {
        // Check if the card belongs to a sub-user of the authenticated user
        const user = await userService.getUserById(req.user._id)
        const isSubUserCard =
          user.subUsers && user.subUsers.some((subUser) => subUser._id.toString() === existingCard.user._id.toString())

        if (!isSubUserCard) {
          return res.status(403).json({ error: "Not authorized to update package details for this card" })
        }
      }

      const updatedCard = await cardService.updatePackageDetails(req.params.id, req.body)
      return res.json(updatedCard)
    } catch (error) {
      console.error("Error in updatePackageDetails:", error)
      res.status(400).json({ error: error.message })
    }
  }

  // Link menu to restaurant card
  async linkMenuToRestaurantCard(req, res) {
    try {
      console.log("Link menu to restaurant card:", req.params.id, "menu:", req.body.menuId)

      // Check if menu ID is provided
      if (!req.body.menuId) {
        return res.status(400).json({ error: "Menu ID is required" })
      }

      // First, check if the card belongs to the user
      const existingCard = await cardService.getCardDetails(req.params.id)
      if (existingCard.user._id.toString() !== req.user._id.toString()) {
        // Check if the card belongs to a sub-user of the authenticated user
        const user = await userService.getUserById(req.user._id)
        const isSubUserCard =
          user.subUsers && user.subUsers.some((subUser) => subUser._id.toString() === existingCard.user._id.toString())

        if (!isSubUserCard) {
          return res.status(403).json({ error: "Not authorized to link menu to this card" })
        }
      }

      const updatedCard = await cardService.linkMenuToRestaurantCard(req.params.id, req.body.menuId)
      return res.json(updatedCard)
    } catch (error) {
      console.error("Error in linkMenuToRestaurantCard:", error)
      res.status(400).json({ error: error.message })
    }
  }

  // Fetch cards by package type
  async fetchCardsByPackageType(req, res) {
    try {
      console.log("Fetch cards by package type:", req.params.packageType, "for user:", req.user._id)

      const result = await cardService.getCardsByPackageType(req.user._id, req.params.packageType)
      return res.json(result)
    } catch (error) {
      console.error("Error in fetchCardsByPackageType:", error)
      res.status(400).json({ error: error.message })
    }
  }
  // Get deleted cards
  async getDeletedCards(req, res) {
    try {
      const result = await cardService.getDeletedCards(req.user._id);
      
      res.status(200).json({
        success: true,
        count: result.total,
        data: result.cards
      });
    } catch (error) {
      console.error("Error in getDeletedCards:", error);
      res.status(400).json({ error: error.message });
    }
  }

  // Restore a deleted card
  async restoreCard(req, res) {
    try {
      const { id } = req.params;
      
      // Check if the card belongs to the user
      const isOwner = await cardService.checkCardOwnership(id, req.user._id);
      if (!isOwner) {
        return res.status(403).json({ error: "Not authorized to restore this card" });
      }
      
      const restoredCard = await cardService.restoreCard(id);
      
      res.status(200).json({
        success: true,
        message: "Card restored successfully",
        data: restoredCard
      });
    } catch (error) {
      console.error("Error in restoreCard:", error);
      res.status(400).json({ error: error.message });
    }
  }

  // Permanently delete a card
  async permanentlyDeleteCard(req, res) {
    try {
      const { id } = req.params;
      
      // Check if the card belongs to the user
      const isOwner = await cardService.checkCardOwnership(id, req.user._id);
      if (!isOwner) {
        return res.status(403).json({ error: "Not authorized to permanently delete this card" });
      }
      
      await cardService.permanentlyDeleteCard(id);
      
      res.status(200).json({
        success: true,
        message: "Card permanently deleted"
      });
    } catch (error) {
      console.error("Error in permanentlyDeleteCard:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CardController()

