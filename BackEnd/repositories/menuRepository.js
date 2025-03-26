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
}

module.exports = new MenuRepository()

