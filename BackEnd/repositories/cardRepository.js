const Card = require('../models/Card');

class CardRepository {
  async getByUsername(username) {
    return Card.findOne({ card_username: username }).populate('user');
  }
}

module.exports = new CardRepository();
