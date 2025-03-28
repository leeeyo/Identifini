// const fileUploadService = require("../services/fileUploadService")

// class FileUploadController {
//   /**
//    * Upload a profile picture
//    * @route POST /api/uploads/profile-picture
//    */
//   async uploadProfilePicture(req, res) {
//     try {
//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           message: "No file uploaded",
//         })
//       }

//       // Upload to S3
//       const imageUrl = await fileUploadService.uploadToS3(req.file, "profile-pictures")

//       // Update user profile with new image URL
//       const userService = require("../services/userService")
//       await userService.updateUser(req.user._id, { profilePicture: imageUrl })

//       res.status(200).json({
//         success: true,
//         data: { imageUrl },
//       })
//     } catch (error) {
//       console.error("Error uploading profile picture:", error)
//       res.status(500).json({
//         success: false,
//         message: "Failed to upload profile picture",
//         error: error.message,
//       })
//     }
//   }

//   /**
//    * Upload a card image
//    * @route POST /api/uploads/card-image/:cardId
//    */
//   async uploadCardImage(req, res) {
//     try {
//       const { cardId } = req.params

//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           message: "No file uploaded",
//         })
//       }

//       // Verify card ownership
//       const cardService = require("../services/cardService")
//       const card = await cardService.getCardDetails(cardId)

//       if (card.user._id.toString() !== req.user._id.toString()) {
//         return res.status(403).json({
//           success: false,
//           message: "Not authorized to upload image for this card",
//         })
//       }

//       // Upload to S3
//       const imageUrl = await fileUploadService.uploadToS3(req.file, "card-images")

//       // Update card with new image URL
//       const updatedCard = await cardService.updateCard(cardId, { image: imageUrl })

//       res.status(200).json({
//         success: true,
//         data: {
//           imageUrl,
//           card: updatedCard,
//         },
//       })
//     } catch (error) {
//       console.error("Error uploading card image:", error)
//       res.status(500).json({
//         success: false,
//         message: "Failed to upload card image",
//         error: error.message,
//       })
//     }
//   }

//   /**
//    * Upload a menu item image
//    * @route POST /api/uploads/menu-item-image/:cardId/:menuId/:itemId
//    */
//   async uploadMenuItemImage(req, res) {
//     try {
//       const { cardId, menuId, itemId } = req.params

//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           message: "No file uploaded",
//         })
//       }

//       // Upload to S3
//       const imageUrl = await fileUploadService.uploadToS3(req.file, "menu-item-images")

//       // Update menu item with new image URL
//       const menuService = require("../services/menuService")
//       const menu = await menuService.updateMenuItem(req.user._id, cardId, menuId, itemId, { image: imageUrl })

//       res.status(200).json({
//         success: true,
//         data: {
//           imageUrl,
//           menu,
//         },
//       })
//     } catch (error) {
//       console.error("Error uploading menu item image:", error)
//       res.status(500).json({
//         success: false,
//         message: "Failed to upload menu item image",
//         error: error.message,
//       })
//     }
//   }

//   /**
//    * Delete a file
//    * @route DELETE /api/uploads/file
//    */
//   async deleteFile(req, res) {
//     try {
//       const { fileUrl } = req.body

//       if (!fileUrl) {
//         return res.status(400).json({
//           success: false,
//           message: "File URL is required",
//         })
//       }

//       // Delete from S3
//       await fileUploadService.deleteFromS3(fileUrl)

//       res.status(200).json({
//         success: true,
//         message: "File deleted successfully",
//       })
//     } catch (error) {
//       console.error("Error deleting file:", error)
//       res.status(500).json({
//         success: false,
//         message: "Failed to delete file",
//         error: error.message,
//       })
//     }
//   }
// }

// module.exports = new FileUploadController()

