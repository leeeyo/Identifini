const express = require("express")
const router = express.Router()

// GET /api/cards-test - Public test route
router.get("/cards-test", (req, res) => {
  console.log("GET /api/cards-test route hit")
  res.json({
    message: "Cards test route is working",
    cards: [
      {
        _id: "test-id-1",
        card_username: "test-user",
        display_name: "Test User",
        bio: "This is a test card",
        created_at: new Date().toISOString(),
      },
    ],
  })
})

module.exports = router

