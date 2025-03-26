const express = require("express")
const router = express.Router()
const subUserController = require("../controllers/subUserController")
const { protect } = require("../middleware/authMiddleware")

// Log available controller methods for debugging
console.log("subUserController methods:", Object.keys(subUserController))

// Test route that doesn't require authentication
router.get("/test", (req, res) => {
  console.log("GET /api/sub-users/test route hit")
  res.json({ message: "Sub-user routes are working" })
})

// Apply authentication middleware to protected routes
router.use(protect)

// GET /api/sub-users - Get all sub-users for the authenticated user
router.get("/", subUserController.getSubUsers)

// POST /api/sub-users - Create a new sub-user
router.post("/", subUserController.createSubUser)

// GET /api/sub-users/:id - Get a sub-user by ID
router.get("/:id", subUserController.getSubUser)

// PUT /api/sub-users/:id - Update a sub-user
router.put("/:id", subUserController.updateSubUser)

// DELETE /api/sub-users/:id - Delete a sub-user
router.delete("/:id", subUserController.deleteSubUser)

module.exports = router

