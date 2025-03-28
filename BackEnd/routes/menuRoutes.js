const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// Standalone menu routes (not nested under cards)
router.get("/", menuController.getAllMenusForUser);
router.get("/:menuId", menuController.getMenuById);

module.exports = router;