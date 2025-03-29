const mongoose = require('mongoose');
const Menu = require('../models/Menu');

// Replace with your actual MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/identifini'; // Update this!

async function updateExistingMenus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Update all menus to add isDeleted field if missing
    const result = await Menu.updateMany(
      { isDeleted: { $exists: false } },
      { $set: { isDeleted: false, deletedAt: null } }
    );
    
    console.log('Updated menus:', result.modifiedCount);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateExistingMenus();