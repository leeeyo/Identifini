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
)

// Add index for faster queries
menuSchema.index({ card: 1 })

const Menu = mongoose.model("Menu", menuSchema)

module.exports = Menu

