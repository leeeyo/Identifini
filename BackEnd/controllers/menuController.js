const Menu = require("../models/Menu")
const Card = require("../models/Card")
const mongoose = require("mongoose")
const menuService = require("../services/menuService")

// Create a new menu for a card
exports.createMenu = async (req, res) => {
  try {
    const { cardId } = req.params
    const menu = await menuService.createMenu(req.user._id, cardId, req.body)

    res.status(201).json({
      success: true,
      data: menu,
    })
  } catch (error) {
    console.error("Error creating menu:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create menu",
      error: error.message,
    })
  }
}

// Get all menus for a card
exports.getAllMenus = async (req, res) => {
  try {
    const { cardId } = req.params
    const menus = await menuService.getAllMenus(req.user._id, cardId)

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    })
  } catch (error) {
    console.error("Error fetching menus:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch menus",
      error: error.message,
    })
  }
}

// Get a specific menu
exports.getMenu = async (req, res) => {
  try {
    const { cardId, menuId } = req.params
    const menu = await menuService.getMenu(req.user._id, cardId, menuId)

    res.status(200).json({
      success: true,
      data: menu,
    })
  } catch (error) {
    console.error("Error fetching menu:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
      error: error.message,
    })
  }
}

// Update a menu
exports.updateMenu = async (req, res) => {
  try {
    const { cardId, menuId } = req.params
    const menu = await menuService.updateMenu(req.user._id, cardId, menuId, req.body)

    res.status(200).json({
      success: true,
      data: menu,
    })
  } catch (error) {
    console.error("Error updating menu:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update menu",
      error: error.message,
    })
  }
}

// Delete a menu
exports.deleteMenu = async (req, res) => {
  try {
    const { cardId, menuId } = req.params
    await menuService.deleteMenu(req.user._id, cardId, menuId)

    res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting menu:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete menu",
      error: error.message,
    })
  }
}

// Get all menu items for a menu
exports.getAllMenuItems = async (req, res) => {
  console.log("Received request for cardId:", req.params.cardId)
  console.log("Received request for menuId:", req.params.menuId)

  try {
    const { cardId, menuId } = req.params
    const items = await menuService.getAllMenuItems(req.user._id, cardId, menuId)

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
      error: error.message,
    })
  }
}


// Get a specific menu item
exports.getMenuItem = async (req, res) => {
  try {
    const { cardId, menuId, itemId } = req.params
    const item = await menuService.getMenuItem(req.user._id, cardId, menuId, itemId)

    res.status(200).json({
      success: true,
      data: item,
    })
  } catch (error) {
    console.error("Error fetching menu item:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
      error: error.message,
    })
  }
}



// Add a menu item to a menu
exports.addMenuItem = async (req, res) => {
  try {
    const { cardId, menuId } = req.params
    const menu = await menuService.addMenuItem(req.user._id, cardId, menuId, req.body)

    res.status(201).json({
      success: true,
      data: menu,
    })
  } catch (error) {
    console.error("Error adding menu item:", error)
    res.status(500).json({
      success: false,
      message: "Failed to add menu item",
      error: error.message,
    })
  }
}

// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { cardId, menuId, itemId } = req.params
    const menu = await menuService.updateMenuItem(req.user._id, cardId, menuId, itemId, req.body)

    res.status(200).json({
      success: true,
      data: menu,
    })
  } catch (error) {
    console.error("Error updating menu item:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update menu item",
      error: error.message,
    })
  }
}

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { cardId, menuId, itemId } = req.params
    const menu = await menuService.deleteMenuItem(req.user._id, cardId, menuId, itemId)

    res.status(200).json({
      success: true,
      data: menu,
      message: "Menu item deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
      error: error.message,
    })
  }
}

