const express = require("express")
const router = express.Router({ mergeParams: true })
const menuController = require("../controllers/menuController")
const { protect } = require("../middleware/authMiddleware")
const debugMiddleware = require("../middleware/debugMiddleware")

router.use(protect)
router.use(debugMiddleware) // Add debug middleware


// Routes for menus within a card context
router.route("/").get(menuController.getAllMenus).post(menuController.createMenu)

// Add trash routes
router.get("/trash", menuController.getDeletedMenus)
router.post("/:menuId/restore", menuController.restoreMenu)
router.delete("/:menuId/permanent", menuController.permanentlyDeleteMenu)


router.route("/:menuId").get(menuController.getMenu).put(menuController.updateMenu).delete(menuController.deleteMenu)


// Routes for menu items
router.route("/:menuId/items").get(menuController.getAllMenuItems).post(menuController.addMenuItem)

router
  .route("/:menuId/items/:itemId")
  .get(menuController.getMenuItem)
  .put(menuController.updateMenuItem)
  .delete(menuController.deleteMenuItem)

module.exports = router

