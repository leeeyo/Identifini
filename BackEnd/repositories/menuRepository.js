const Menu = require("../models/Menu")

class MenuRepository {
  async create(menuData) {
    return await Menu.create(menuData)
  }

  async findByCardId(cardId, options = {}) {
    const { sort = { displayOrder: 1, createdAt: -1 } } = options
    return await Menu.find({ card: cardId }).sort(sort)
  }

  async findById(menuId) {
    return await Menu.findById(menuId)
  }

  async findByIdAndCardId(menuId, cardId) {
    return await Menu.findOne({ _id: menuId, card: cardId })
  }

  async update(menuId, cardId, updateData) {
    return await Menu.findOneAndUpdate({ _id: menuId, card: cardId }, updateData, { new: true, runValidators: true })
  }

  async delete(menuId, cardId) {
    return await Menu.findOneAndDelete({ _id: menuId, card: cardId })
  }

// Find a deleted menu by ID and card ID
async findDeletedByIdAndCardId(menuId, cardId) {
  return await Menu.findOne({ 
    _id: menuId, 
    card: cardId, 
    isDeleted: true,
    includeDeleted: true // This flag tells our middleware to include deleted records
  });
}

// Restore a soft deleted menu
async restore(menuId) {
  const menu = await Menu.findOne({ 
    _id: menuId, 
    isDeleted: true,
    includeDeleted: true 
  });
  
  if (!menu) return null;
  
  menu.isDeleted = false;
  menu.deletedAt = null;
  return await menu.save();
}
}

module.exports = new MenuRepository()

