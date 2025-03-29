const { MongoClient, ObjectId } = require('mongodb');

// Replace with your actual MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/identifini'; // Update this!

async function directMongoQuery() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected directly to MongoDB');
    
    const db = client.db(); // Get the default database
    
    // List all collections to find the menu collection
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Assume the collection is named 'menus'
    const menuCollection = db.collection('menus');
    
    // Find all documents in the collection
    const allMenus = await menuCollection.find({}).toArray();
    console.log('All menus in collection:', allMenus.length);
    
    if (allMenus.length > 0) {
      console.log('Sample menu:', allMenus[0]);
    }
    
    // Try to find the menu we created
    const cardId = '67e6a9ea8f33d6567d08c243';
    
    // Query with string
    const menusWithString = await menuCollection.find({ card: cardId }).toArray();
    console.log('Menus with string cardId:', menusWithString.length);
    
    // Query with ObjectId
    const menusWithObjectId = await menuCollection.find({ card: new ObjectId(cardId) }).toArray();
    console.log('Menus with ObjectId cardId:', menusWithObjectId.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

directMongoQuery();