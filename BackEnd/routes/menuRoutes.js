const express = require("express")
const router = express.Router({ mergeParams: true }) // Important to access params from parent router
const menuController = require("../controllers/menuController")
const { protect } = require("../middleware/authMiddleware")

// Apply authentication middleware to all routes
router.use(protect)

// Routes for menus
router.route("/").get(menuController.getAllMenus).post(menuController.createMenu)

router.route("/:menuId").get(menuController.getMenu).put(menuController.updateMenu).delete(menuController.deleteMenu)

// Routes for menu items
router.route("/:menuId/items").post(menuController.addMenuItem)

router.route("/:menuId/items/:itemId").put(menuController.updateMenuItem).delete(menuController.deleteMenuItem)

module.exports = router

