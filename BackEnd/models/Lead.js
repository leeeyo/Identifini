const mongoose = require("mongoose")

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  cardUsername: {
    type: String,
    required: true,
    trim: true,
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Lead", leadSchema)

