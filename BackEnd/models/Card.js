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
  phone: {
    type: String,
    default : "",
  },
  tagline: {
    type: String,
    default: "",
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
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
},
{
  timestamps: true,
})

// Add middleware to exclude deleted records by default
cardSchema.pre("find", function () {
  // Only apply this filter if it's not explicitly overridden
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false })
  }

  // Remove the includeDeleted flag from the query
  delete this.getQuery().includeDeleted
})

cardSchema.pre("findOne", function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false })
  }
  delete this.getQuery().includeDeleted
})

cardSchema.pre("findById", function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false })
  }
  delete this.getQuery().includeDeleted
})

cardSchema.pre("countDocuments", function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false })
  }
  delete this.getQuery().includeDeleted
})

// Method to soft delete
cardSchema.methods.softDelete = async function () {
  this.isDeleted = true
  this.deletedAt = new Date()
  return await this.save()
}

// Method to restore
cardSchema.methods.restore = async function () {
  this.isDeleted = false
  this.deletedAt = null
  return await this.save()
}

// Static method to find deleted records
cardSchema.statics.findDeleted = function (query = {}) {
  return this.find({ ...query, isDeleted: true })
}

// Static method to find all records including deleted
cardSchema.statics.findWithDeleted = function (query = {}) {
  return this.find({ ...query, includeDeleted: true })
}

const Card = mongoose.model("Card", cardSchema)

module.exports = Card

module.exports = mongoose.model("Card", cardSchema);