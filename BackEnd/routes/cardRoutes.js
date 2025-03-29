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

// Get deleted cards 
router.get("/trash", cardController.getDeletedCards)

// Get a card by username
router.get("/username/:username", cardController.fetchCardByUsername)

// Create a new card
router.post("/", cardController.createCard)

// DYNAMIC PARAMETER ROUTES AFTER SPECIFIC ROUTES
// Get, update, delete a card by ID
router.get("/:cardId", cardController.fetchCard)
router.put("/:cardId", cardController.updateCard)
router.delete("/:cardId", cardController.deleteCard)

// Duplicate a card
router.post("/:cardId/duplicate", cardController.duplicateCard)

// Transfer a card to another user
router.post("/:cardId/transfer", cardController.transferCard)

// Package-related routes
router.put("/:cardId/package-type", cardController.changePackageType)
router.put("/:cardId/package-details", cardController.updatePackageDetails)

// Restaurant-specific routes
router.put("/:cardId/link-menu", cardController.linkMenuToRestaurantCard)

// Restore a deleted card
router.post("/:cardId/restore", cardController.restoreCard)

// Permanently delete a card
router.delete("/:cardId/permanent", cardController.permanentlyDeleteCard)

// Nested menu routes
router.use("/:cardId/menus", require("./cardMenuRoutes"));

module.exports = router;