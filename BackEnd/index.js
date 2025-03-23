const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const cardRoutes = require('./routes/CardRoutes');  // Make sure this is correct

// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/cards', cardRoutes); // This will handle routes like /api/cards/:username

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {

})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect:', err));
