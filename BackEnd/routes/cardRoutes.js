const express = require("express")
const router = express.Router()
const cardController = require("../controllers/cardController")

// Log available controller methods for debugging
console.log("Available controller methods:", Object.keys(cardController))

// GET /api/cards - Get all cards
router.get("/", (req, res) => {
  console.log("GET /api/cards route hit")
  return cardController.fetchAllCards(req, res)
})

// GET /api/cards/test - Test route
router.get("/test", (req, res) => {
  console.log("GET /api/cards/test route hit")
  res.json({ message: "Card routes are working" })
})

// GET /api/cards/:id - Get a card by ID
router.get("/:id", (req, res) => {
  console.log("GET /api/cards/:id route hit", req.params.id)
  return cardController.fetchCard(req, res)
})

// GET /api/cards/username/:username - Get a card by username
router.get("/username/:username", (req, res) => {
  console.log("GET /api/cards/username/:username route hit", req.params.username)
  return cardController.fetchCardByUsername(req, res)
})

// POST /api/cards - Create a new card
router.post("/", (req, res) => {
  console.log("POST /api/cards route hit")
  return cardController.createCard(req, res)
})

// PUT /api/cards/:id - Update a card
router.put("/:id", (req, res) => {
  console.log("PUT /api/cards/:id route hit", req.params.id)
  return cardController.updateCard(req, res)
})

// DELETE /api/cards/:id - Delete a card
router.delete("/:id", (req, res) => {
  console.log("DELETE /api/cards/:id route hit", req.params.id)
  return cardController.deleteCard(req, res)
})

// POST /api/cards/:id/duplicate - Duplicate a card
router.post("/:id/duplicate", (req, res) => {
  console.log("POST /api/cards/:id/duplicate route hit", req.params.id)
  return cardController.duplicateCard(req, res)
})

module.exports = router

