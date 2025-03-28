const mongoose = require("mongoose")

const cardViewSchema = new mongoose.Schema({
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
    required: true,
    index: true,
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    default: "",
  },
  referrer: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

cardViewSchema.index({ card: 1, timestamp: 1 })

module.exports = mongoose.model("CardView", cardViewSchema)

