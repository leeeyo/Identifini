const express = require("express")
const router = express.Router()
const cardController = require("../controllers/cardController")
const { protect } = require("../middleware/authMiddleware");

// Protect all routes
router.use(protect)

// Get all cards for the authenticated user
router.get("/", cardController.fetchAllCards)

// Get all cards for the authenticated user and their sub-users
router.get("/all", cardController.fetchAllCardsForUserAndSubUsers)

// Get cards by package type
router.get("/package/:packageType", cardController.fetchCardsByPackageType)

// Create a new card
router.post("/", cardController.createCard)

// Get, update, delete a card by ID
router.get("/:id", cardController.fetchCard)
router.put("/:id", cardController.updateCard)
router.delete("/:id", cardController.deleteCard)

// Get a card by username
router.get("/username/:username", cardController.fetchCardByUsername)

// Duplicate a card
router.post("/:id/duplicate", cardController.duplicateCard)

// Transfer a card to another user
router.post("/:id/transfer", cardController.transferCard)

// Package-related routes
router.put("/:id/package-type", cardController.changePackageType)
router.put("/:id/package-details", cardController.updatePackageDetails)

// Restaurant-specific routes
router.put("/:id/link-menu", cardController.linkMenuToRestaurantCard)

// Get deleted cards
router.get("/trash", cardController.getDeletedCards)

// Restore a deleted card
router.post("/:id/restore", cardController.restoreCard)

// Permanently delete a card
router.delete("/:id/permanent", cardController.permanentlyDeleteCard)

// Nested menu routes
router.use("/:cardId/menus", require("./cardMenuRoutes"));

module.exports = router;