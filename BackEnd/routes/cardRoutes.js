const express = require("express")
const router = express.Router()
const cardController = require("../controllers/cardController")
const leadController = require("../controllers/leadController")
const { protect } = require("../middleware/authMiddleware")
const vCardController = require("../controllers/vCardController")
const menuRoutes = require("./menuRoutes")

// Log available controller methods for debugging
console.log("Available controller methods:", Object.keys(cardController))

// Apply authentication middleware to all routes
router.use(protect)

// GET /api/cards - Get all cards with pagination
router.get("/", (req, res) => {
  console.log("GET /api/cards route hit with query:", req.query)
  return cardController.fetchAllCards(req, res)
})

// GET /api/cards/all - Get all cards for the user and their sub-users
router.get("/all", (req, res) => {
  console.log("GET /api/cards/all route hit with query:", req.query)
  return cardController.fetchAllCardsForUserAndSubUsers(req, res)
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

// POST /api/cards/:id/transfer - Transfer a card to another user
router.post("/:id/transfer", (req, res) => {
  console.log("POST /api/cards/:id/transfer route hit", req.params.id)
  return cardController.transferCard(req, res)
})

// GET /api/cards/username/:username/vcard - Get a vCard for a card
router.get("/username/:username/vcard", (req, res) => {
  console.log("GET /api/cards/username/:username/vcard route hit", req.params.username)
  return vCardController.generateVCard(req, res)
})

// Lead-related routes
// GET /api/cards/username/:username/leads - Get leads for a card
router.get("/username/:username/leads", (req, res) => {
  console.log("GET /api/cards/username/:username/leads route hit", req.params.username)
  return leadController.getLeadsByCardUsername(req, res)
})

// POST /api/cards/username/:username/leads - Submit lead for a card
router.post("/username/:username/leads", (req, res) => {
  console.log("POST /api/cards/username/:username/leads route hit", req.params.username)
  return leadController.submitLead(req, res)
})

// DELETE /api/cards/username/:username/leads/:leadId - Delete a lead
router.delete("/username/:username/leads/:leadId", (req, res) => {
  console.log("DELETE /api/cards/username/:username/leads/:leadId route hit", req.params)
  return leadController.deleteLead(req, res)
})

// Nested routes for menus
router.use("/:cardId/menus", menuRoutes)

module.exports = router

