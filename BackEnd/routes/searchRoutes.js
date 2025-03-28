const express = require("express")
const router = express.Router()
const searchController = require("../controllers/searchController")
const { protect } = require("../middleware/authMiddleware")

// Apply authentication middleware to all routes
router.use(protect)

// Search routes
router.get("/cards", searchController.searchCards)
router.get("/users", searchController.searchUsers)
router.get("/menus", searchController.searchMenus)

module.exports = router

