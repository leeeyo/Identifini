const mongoose = require("mongoose")

const cardInteractionSchema = new mongoose.Schema({
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
    required: true,
    index: true,
  },
  interactionType: {
    type: String,
    required: true,
    enum: ["button_click", "social_link", "phone_call", "email", "wifi_scan", "map_view", "menu_view", "custom"],
    index: true,
  },
  interactionData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

cardInteractionSchema.index({ card: 1, timestamp: 1 })
cardInteractionSchema.index({ card: 1, interactionType: 1 })

module.exports = mongoose.model("CardInteraction", cardInteractionSchema)

