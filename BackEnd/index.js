const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cardRoutes = require('./routes/cardRoutes');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect:', err));

app.use(cors());
app.use(express.json());

// Use your User routes
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
