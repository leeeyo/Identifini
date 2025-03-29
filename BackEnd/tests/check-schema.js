const mongoose = require('mongoose');
const Menu = require('../models/Menu');

// Replace with your actual MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/identifini'; // Update this!

async function checkSchemaMiddleware() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check for middleware
    console.log('Menu Schema Middleware:');
    
    // Pre-find hooks
    const preFindHooks = Menu.schema._hooks ? 
      (Menu.schema._hooks.find || []).length : 
      'No _hooks property';
    console.log('Pre-find hooks:', preFindHooks);
    
    // Query helpers
    const queryHelpers = Object.keys(Menu.schema.query || {});
    console.log('Query helpers:', queryHelpers.length ? queryHelpers : 'None');
    
    // Instance methods
    const methods = Object.keys(Menu.schema.methods || {});
    console.log('Instance methods:', methods.length ? methods : 'None');
    
    // Statics
    const statics = Object.keys(Menu.schema.statics || {});
    console.log('Static methods:', statics.length ? statics : 'None');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchemaMiddleware();