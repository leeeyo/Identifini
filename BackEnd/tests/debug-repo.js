const mongoose = require('mongoose');
const Menu = require('../models/Menu');

// Replace with your actual MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/identifini'; // Update this!

async function debugRepository() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const cardId = '67e6a9ea8f33d6567d08c243';
    
    // Simulate your repository method
    console.log('Simulating findByCardId with cardId:', cardId);
    
    // Convert to ObjectId
    const cardObjectId = new mongoose.Types.ObjectId(cardId);
    console.log('Converted to ObjectId:', cardObjectId);
    
    // Query with various conditions
    console.log('\nQuery 1: Basic query');
    const query1 = { card: cardObjectId };
    console.log('Query:', JSON.stringify(query1));
    const menus1 = await Menu.find(query1);
    console.log('Results:', menus1.length);
    
    console.log('\nQuery 2: With isDeleted check');
    const query2 = { card: cardObjectId, isDeleted: { $ne: true } };
    console.log('Query:', JSON.stringify(query2));
    const menus2 = await Menu.find(query2);
    console.log('Results:', menus2.length);
    
    console.log('\nQuery 3: With isActive check');
    const query3 = { card: cardObjectId, isActive: true };
    console.log('Query:', JSON.stringify(query3));
    const menus3 = await Menu.find(query3);
    console.log('Results:', menus3.length);
    
    console.log('\nQuery 4: All possible conditions');
    const query4 = { card: cardObjectId, isDeleted: { $ne: true }, isActive: true };
    console.log('Query:', JSON.stringify(query4));
    const menus4 = await Menu.find(query4);
    console.log('Results:', menus4.length);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

debugRepository();