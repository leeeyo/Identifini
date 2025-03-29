const mongoose = require('mongoose');
const Menu = require('../models/Menu');

// Replace with your actual MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/identifini'; // Update this!

async function checkIdStorage() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const cardId = '67e6a9ea8f33d6567d08c243';
    
    // Find the menu we just created
    const menu = await Menu.findOne({ title: 'Test Menu 1743227776810' });
    
    if (menu) {
      console.log('Found the menu!');
      console.log('Menu ID:', menu._id);
      console.log('Card ID in menu:', menu.card);
      console.log('Card ID type:', typeof menu.card);
      console.log('Is ObjectId?', menu.card instanceof mongoose.Types.ObjectId);
      console.log('Card ID toString():', menu.card.toString());
      console.log('Does toString() match our cardId?', menu.card.toString() === cardId);
      
      // Try different query approaches
      console.log('\nTrying different query approaches:');
      
      // Query 1: Using the exact card from the menu
      const menus1 = await Menu.find({ card: menu.card });
      console.log('Query with menu.card:', menus1.length);
      
      // Query 2: Using string
      const menus2 = await Menu.find({ card: cardId });
      console.log('Query with string cardId:', menus2.length);
      
      // Query 3: Using new ObjectId
      const menus3 = await Menu.find({ card: new mongoose.Types.ObjectId(cardId) });
      console.log('Query with new ObjectId:', menus3.length);
      
      // Query 4: No conditions
      const allMenus = await Menu.find({});
      console.log('All menus in database:', allMenus.length);
      
      // Query 5: Check for isDeleted flag
      const menus5 = await Menu.find({ card: menu.card, isDeleted: { $ne: true } });
      console.log('Query with isDeleted check:', menus5.length);
    } else {
      console.log('Menu not found!');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkIdStorage();