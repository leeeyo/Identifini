const express = require('express');
const router = express.Router();
const Card = require('../models/Card'); // Your Card model

// Route to get a card by its username
router.get('/:username', async (req, res) => {
  try {
    console.log("Fetching card for username:", req.params.username); // Debugging log

    // Find the card based on the username passed in the URL
    const card = await Card.findOne({ card_username: req.params.username });

    // If the card is not found, return an error
    if (!card) {
      console.log('Card not found for username:', req.params.username); // Debugging log
      return res.status(404).json({ error: 'Card not found' });
    }

    // If the card is found, return it in the response
    console.log('Card found:', card); // Debugging log
    res.json(card);
  } catch (err) {
    console.error('Error fetching card:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
