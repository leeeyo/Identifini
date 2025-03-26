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
    // Verify card exists and belongs to the user
    const card = await cardRepository.getByIdAndUserId(cardId, userId)
    if (!card) {
      throw new Error("Card not found or you do not have permission to access it")
    }

    // Get all menus for the card
    return await menuRepository.findByCardId(cardId)
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

}


module.exports = new MenuService()

