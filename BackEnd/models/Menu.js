const mongoose = require("mongoose")

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Menu item price is required"],
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

const menuSchema = new mongoose.Schema(
  {
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: [true, "Card reference is required"],
    },
    title: {
      type: String,
      required: [true, "Menu title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    items: [menuItemSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
{
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
},
{ timestamps: true },
)

// Add middleware to exclude deleted records by default
menuSchema.pre("find", function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false })
  }
  delete this.getQuery().includeDeleted
})

menuSchema.pre("findOne", function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false })
  }
  delete this.getQuery().includeDeleted
})

menuSchema.pre("findById", function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false })
  }
  delete this.getQuery().includeDeleted
})

menuSchema.pre("countDocuments", function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false })
  }
  delete this.getQuery().includeDeleted
})

// Method to soft delete
menuSchema.methods.softDelete = async function () {
  this.isDeleted = true
  this.deletedAt = new Date()
  return await this.save()
}

// Method to restore
menuSchema.methods.restore = async function () {
  this.isDeleted = false
  this.deletedAt = null
  return await this.save()
}

// Static method to find deleted records
menuSchema.statics.findDeleted = function (query = {}) {
  return this.find({ ...query, isDeleted: true })
}

// Static method to find all records including deleted
menuSchema.statics.findWithDeleted = function (query = {}) {
  return this.find({ ...query, includeDeleted: true })
}

// Add index for faster queries
menuSchema.index({ card: 1 })

const Menu = mongoose.model("Menu", menuSchema)

module.exports = Menu

