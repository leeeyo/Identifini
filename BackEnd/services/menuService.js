const menuRepository = require("../repositories/menuRepository")
const cardRepository = require("../repositories/cardRepository")

class MenuService {
  async createMenu(userId, cardId, menuData) {
    // Verify card exists and belongs to the user
    const card = await cardRepository.getByIdAndUserId(cardId, userId)
    if (!card) {
      throw new Error("Card not found or you do not have permission to modify it")
    }

    // Create the menu
    const newMenuData = {
      ...menuData,
      card: cardId,
    }

    return await menuRepository.create(newMenuData)
  }

  async getAllMenus(userId, cardId) {
    console.log(`Getting menus for user ${userId} and card ${cardId}`);
    
    // Verify card exists and belongs to the user
    const card = await cardRepository.getByIdAndUserId(cardId, userId);
    console.log("Card found:", card ? "Yes" : "No");
    
    if (!card) {
      throw new Error("Card not found or you do not have permission to access it");
    }
  
    // Get all menus for the card
    const menus = await menuRepository.findByCardId(cardId);
    console.log(`Found ${menus.length} menus`);
    console.log("Menus:", JSON.stringify(menus, null, 2));
    
    return menus;
  }

  async getMenu(userId, cardId, menuId) {
    // Verify card exists and belongs to the user
    const card = await cardRepository.getByIdAndUserId(cardId, userId)
    if (!card) {
      throw new Error("Card not found or you do not have permission to access it")
    }

    // Get the specific menu
    const menu = await menuRepository.findByIdAndCardId(menuId, cardId)
    if (!menu) {
      throw new Error("Menu not found")
    }

    return menu
  }

  async updateMenu(userId, cardId, menuId, updateData) {
    // Verify card exists and belongs to the user
    const card = await cardRepository.getByIdAndUserId(cardId, userId)
    if (!card) {
      throw new Error("Card not found or you do not have permission to modify it")
    }

    // Update the menu
    const menu = await menuRepository.update(menuId, cardId, updateData)
    if (!menu) {
      throw new Error("Menu not found")
    }

    return menu
  }

  async deleteMenu(userId, cardId, menuId) {
    // Verify card exists and belongs to the user
    const card = await cardRepository.getByIdAndUserId(cardId, userId)
    if (!card) {
      throw new Error("Card not found or you do not have permission to modify it")
    }

    // Delete the menu
    const menu = await menuRepository.delete(menuId, cardId)
    if (!menu) {
      throw new Error("Menu not found")
    }

    return menu
  }

  async addMenuItem(userId, cardId, menuId, itemData) {
    // Verify card exists and belongs to the user
    const card = await cardRepository.getByIdAndUserId(cardId, userId)
    if (!card) {
      throw new Error("Card not found or you do not have permission to modify it")
    }

    // Find the menu
    const menu = await menuRepository.findByIdAndCardId(menuId, cardId)
    if (!menu) {
      throw new Error("Menu not found")
    }

    // Add the menu item
    menu.items.push(itemData)
    await menu.save()

    return menu
  }

  async updateMenuItem(userId, cardId, menuId, itemId, updateData) {
    // Verify card exists and belongs to the user
    const card = await cardRepository.getByIdAndUserId(cardId, userId)
    if (!card) {
      throw new Error("Card not found or you do not have permission to modify it")
    }

    // Find the menu
    const menu = await menuRepository.findByIdAndCardId(menuId, cardId)
    if (!menu) {
      throw new Error("Menu not found")
    }

    // Find the item index
    const itemIndex = menu.items.findIndex((item) => item._id.toString() === itemId)
    if (itemIndex === -1) {
      throw new Error("Menu item not found")
    }

    // Update the item
    menu.items[itemIndex] = {
      ...menu.items[itemIndex].toObject(),
      ...updateData,
    }

    await menu.save()

    return menu
  }

  async deleteMenuItem(userId, cardId, menuId, itemId) {
    // Verify card exists and belongs to the user
    const card = await cardRepository.getByIdAndUserId(cardId, userId)
    if (!card) {
      throw new Error("Card not found or you do not have permission to modify it")
    }

    // Find the menu and pull the item
    const menu = await menuRepository.update(menuId, cardId, {
      $pull: { items: { _id: itemId } },
    })

    if (!menu) {
      throw new Error("Menu not found")
    }

    return menu
  }
  
  // Get all menu items for a specific menu
async getAllMenuItems(userId, cardId, menuId) {
  // Verify card exists and belongs to the user
  const card = await cardRepository.getByIdAndUserId(cardId, userId)
  if (!card) {
    throw new Error("Card not found or you do not have permission to access it")
  }

  // Get the menu
  const menu = await menuRepository.findByIdAndCardId(menuId, cardId)
  if (!menu) {
    throw new Error("Menu not found")
  }

  return menu.items
}

// Get a specific menu item
async getMenuItem(userId, cardId, menuId, itemId) {
  // Verify card exists and belongs to the user
  const card = await cardRepository.getByIdAndUserId(cardId, userId)
  if (!card) {
    throw new Error("Card not found or you do not have permission to access it")
  }

  // Get the menu
  const menu = await menuRepository.findByIdAndCardId(menuId, cardId)
  if (!menu) {
    throw new Error("Menu not found")
  }

  // Find the item
  const item = menu.items.find((item) => item._id.toString() === itemId)
  if (!item) {
    throw new Error("Menu item not found")
  }

  return item
}

async getMenuById(userId, menuId) {
  // Find the menu
  const menu = await menuRepository.findById(menuId);
  if (!menu) {
    throw new Error("Menu not found");
  }
  
  // Verify the menu belongs to a card owned by the user
  const card = await cardRepository.getByIdAndUserId(menu.card, userId);
  if (!card) {
    throw new Error("Not authorized to access this menu");
  }
  
  return menu;
}

// Get all menus for the current user (across all cards)
async getAllMenusForUser(userId) {
  // Get all cards owned by the user
  const cards = await cardRepository.getByOwnerId(userId);
  const cardIds = cards.map(card => card._id);
  
  // Get all menus for these cards
  const menus = await Promise.all(
    cardIds.map(cardId => menuRepository.findByCardId(cardId))
  );
  
  // Flatten the array of menus
  return menus.flat();
}
//soft delete menu method
async deleteMenu(userId, cardId, menuId) {
  // Verify card exists and belongs to the user
  const card = await cardRepository.getByIdAndUserId(cardId, userId)
  if (!card) {
    throw new Error("Card not found or you do not have permission to modify it")
  }

  // Find the menu
  const menu = await menuRepository.findByIdAndCardId(menuId, cardId)
  if (!menu) {
    throw new Error("Menu not found")
  }

  // Use soft delete instead of permanent delete
  return await menuRepository.softDelete(menuId)
}

// Restore a soft deleted menu

async restoreMenu(userId, cardId, menuId) {
  // Verify card exists and belongs to the user
  const card = await cardRepository.getByIdAndUserId(cardId, userId);
  if (!card) {
    throw new Error("Card not found or you do not have permission to modify it");
  }

  // Find the deleted menu using the repository
  const menu = await menuRepository.findDeletedByIdAndCardId(menuId, cardId);
  if (!menu) {
    throw new Error("Menu not found or not deleted");
  }

  return await menuRepository.restore(menuId);
}

// method to get deleted menus
async getDeletedMenus(userId, cardId) {
  // Verify card exists and belongs to the user
  const card = await cardRepository.getByIdAndUserId(cardId, userId)
  if (!card) {
    throw new Error("Card not found or you do not have permission to access it")
  }

  return await menuRepository.findDeleted({ card: cardId })
}

  // permanentlyDeleteMenu method
  async permanentlyDeleteMenu(userId, cardId, menuId) {
    // Verify card exists and belongs to the user
    const card = await cardRepository.getByIdAndUserId(cardId, userId)
    if (!card) {
      throw new Error("Card not found or you do not have permission to modify it")
    }

    const result = await menuRepository.permanentlyDelete(menuId, cardId)
    if (!result) {
      throw new Error("Menu not found")
    }

    return result
  }
}

module.exports = new MenuService()

