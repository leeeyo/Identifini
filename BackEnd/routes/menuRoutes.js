const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// Standalone menu routes (not nested under cards)
router.get("/", menuController.getAllMenusForUser);
router.get("/:menuId", menuController.getMenuById);

// Get deleted menus
router.get("/trash", menuController.getDeletedMenus)

// Restore a deleted menu
router.post("/:menuId/restore", menuController.restoreMenu)

// Permanently delete a menu
router.delete("/:menuId/permanent", menuController.permanentlyDeleteMenu)

module.exports = router;