const cardRepository = require('../repositories/cardRepository');

class CardService {
  async getCardDetails(username) {
    const card = await cardRepository.getByUsername(username);
    if (!card) throw new Error('Card not found.');
    return card;
  }
}

module.exports = new CardService();
