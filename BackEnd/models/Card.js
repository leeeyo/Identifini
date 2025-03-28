const mongoose = require("mongoose");

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
  tagline: {
    type: String,
    default: "",
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
  // New fields for subscription package support:
  package_type: {
    type: String,
    enum: ["individual", "restaurant", "enterprise"],
    required: true,
    default: "individual",
  },
  cover_picture: {
    type: String,
    default: "",
  },
  business_hours: {
    type: String,
    default: "",
  },
  // Sub-models
  individual_details: {
    birthday: String,
    hometown: String,
    current_city: String,
    relationship_status: String,
    job_title: String,
    interests: {
      type: [String],
      default: [],
    },
    resume: {
      education: String,
      experience: String,
      skills: [String],
      certifications: [String],
    },
  },
  restaurant_details: {
    speciality: String,
    amenities: {
      type: [String],
      default: [],
    },
    events: {
      type: [String],
      default: [],
    },
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
    },
  },
  enterprise_details: {
    company_details: {
      founded_time: String,
      headquarters: String,
      employees_number: Number,
    },
    industries_served: {
      type: [String],
      default: [],
    },
    services: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    clients: {
      type: [String],
      default: [],
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Card", cardSchema);