const express = require("express")
const router = express.Router()
const cardController = require("../controllers/cardController")

// Get all cards - this route needs to be added
router.get("/", cardController.fetchAllCards)

// Create a new card
router.post("/", cardController.createCard)

// Get a card by ID
router.get("/id/:id", cardController.fetchCard)

// Get a card by username
router.get("/username/:username", cardController.fetchCardByUsername)

// Update a card
router.put("/:id", cardController.updateCard)

// Delete a card
router.delete("/:id", cardController.deleteCard)

// Duplicate a card
router.post("/:id/duplicate", cardController.duplicateCard)

// Transfer a card to a new owner
router.put("/:id/transfer", cardController.transferCard)

module.exports = router

