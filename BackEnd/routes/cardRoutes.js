const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

router.get('/:username', cardController.fetchCard);

module.exports = router;
