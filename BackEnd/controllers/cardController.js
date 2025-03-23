const cardService = require('../services/cardService');

class CardController {
  async fetchCard(req, res) {
    try {
      const card = await cardService.getCardDetails(req.params.username);
      res.json(card);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new CardController();
