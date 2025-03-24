const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  card_username: {
    type: String,
    required: true,
    unique: true
  },
  display_name: {
    type: String,
    required: true
  },
  bio: String,
  card_pic: String,
  display_address: String,
  theme_color_1: String,
  theme_color_2: String,
  theme_color_3: String,
  // Corrected types for arrays and objects
  social_medias: [{
    platform: String,
    url: String
  }],
  action_buttons: [{
    label: String,
    url: String
  }],
  floating_actions: [{
    icon: String,
    url: String
  }],
  wifi_config: String,
  latitude: String,
  longitude: String,
  custom_map_link: String,
  card_email: String,
  card_wifi_ssid: String,
  card_wifi_password: String,
  extra_photos: [{
    url: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_by: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Card', cardSchema);