const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  card_username: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  display_name: String,
  bio: String,
  social_medias: [{ icon: String, link: String }],
  action_buttons: [{ text: String, link: String }],
  floating_actions: [{ type: String, icon: String, link: String }],
  extra_photos: [String],
  card_pic: String,
  latitude: Number,
  longitude: Number,
  custom_map_link: String,
  display_address: String,
  theme_color_1: String,
  theme_color_2: String,
  theme_color_3: String,
  card_wifi_ssid: String,
  card_wifi_password: String,
}, { timestamps: true });

module.exports = mongoose.model('Card', CardSchema);
