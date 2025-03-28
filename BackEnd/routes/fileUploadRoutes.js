// const express = require("express")
// const router = express.Router()
// const fileUploadController = require("../controllers/fileUploadController")
// const fileUploadService = require("../services/fileUploadService")
// const { protect } = require("../middleware/authMiddleware")

// // Apply authentication middleware to all routes
// router.use(protect)

// // Upload profile picture
// router.post(
//   "/profile-picture",
//   fileUploadService.getImageUploadMiddleware("profilePicture"),
//   fileUploadController.uploadProfilePicture,
// )

// // Upload card image
// router.post(
//   "/card-image/:cardId",
//   fileUploadService.getImageUploadMiddleware("cardImage"),
//   fileUploadController.uploadCardImage,
// )

// // Upload menu item image
// router.post(
//   "/menu-item-image/:cardId/:menuId/:itemId",
//   fileUploadService.getImageUploadMiddleware("menuItemImage"),
//   fileUploadController.uploadMenuItemImage,
// )

// // Delete file
// router.delete("/file", fileUploadController.deleteFile)

// module.exports = router

