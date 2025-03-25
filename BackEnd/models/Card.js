const mongoose = require("mongoose")

const cardSchema = new mongoose.Schema({
  card_username: {
    type: String,
    required: true,
    unique: true,
  },
  display_name: {
    type: String,
    required: true,
  },
  bio: String,
  card_pic: String,
  display_address: String,
  theme_color_1: String,
  theme_color_2: String,
  theme_color_3: String,
  social_medias: {
    type: Array,
    default: [],
  },
  action_buttons: {
    type: Array,
    default: [],
  },
  floating_actions: {
    type: Array,
    default: [],
  },
  wifi_config: String,
  latitude: String,
  longitude: String,
  custom_map_link: String,
  card_email: String,
  card_wifi_ssid: String,
  card_wifi_password: String,
  extra_photos: {
    type: Array,
    default: [],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Now required
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Card", cardSchema)

