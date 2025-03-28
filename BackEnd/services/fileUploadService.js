// const multer = require("multer")
// const path = require("path")
// const fs = require("fs")
// const AWS = require("aws-sdk")

// class FileUploadService {
//   constructor() {
//     // Configure AWS S3
//     this.s3 = new AWS.S3({
//       accessKeyId: process.env.AWS_ACCESS_KEY,
//       secretAccessKey: process.env.AWS_SECRET_KEY,
//       region: process.env.AWS_REGION || "us-east-1",
//     })

//     // Configure multer for local storage (temporary)
//     this.storage = multer.diskStorage({
//       destination: (req, file, cb) => {
//         const uploadDir = path.join(__dirname, "../uploads")
//         if (!fs.existsSync(uploadDir)) {
//           fs.mkdirSync(uploadDir, { recursive: true })
//         }
//         cb(null, uploadDir)
//       },
//       filename: (req, file, cb) => {
//         const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
//         const ext = path.extname(file.originalname)
//         cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
//       },
//     })

//     // File filter for images
//     this.imageFilter = (req, file, cb) => {
//       const allowedTypes = /jpeg|jpg|png|gif|webp/
//       const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
//       const mimetype = allowedTypes.test(file.mimetype)

//       if (extname && mimetype) {
//         return cb(null, true)
//       } else {
//         cb(new Error("Only image files are allowed!"))
//       }
//     }

//     // Create multer upload instances
//     this.uploadImage = multer({
//       storage: this.storage,
//       limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//       fileFilter: this.imageFilter,
//     })

//     this.uploadDocument = multer({
//       storage: this.storage,
//       limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//       fileFilter: (req, file, cb) => {
//         const allowedTypes = /pdf|doc|docx|txt|csv|xls|xlsx/
//         const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())

//         if (extname) {
//           return cb(null, true)
//         } else {
//           cb(new Error("Only document files are allowed!"))
//         }
//       },
//     })
//   }

//   /**
//    * Upload a file to S3
//    * @param {Object} file - File object from multer
//    * @param {string} folder - Folder path in S3 bucket
//    * @returns {Promise<string>} - URL of the uploaded file
//    */
//   async uploadToS3(file, folder = "uploads") {
//     try {
//       const fileContent = fs.readFileSync(file.path)

//       const params = {
//         Bucket: process.env.AWS_S3_BUCKET,
//         Key: `${folder}/${path.basename(file.path)}`,
//         Body: fileContent,
//         ContentType: file.mimetype,
//         ACL: "public-read",
//       }

//       const result = await this.s3.upload(params).promise()

//       // Delete local file after upload
//       fs.unlinkSync(file.path)

//       return result.Location
//     } catch (error) {
//       console.error("Error uploading to S3:", error)
//       throw error
//     }
//   }

//   /**
//    * Delete a file from S3
//    * @param {string} fileUrl - URL of the file to delete
//    * @returns {Promise<Object>} - Deletion result
//    */
//   async deleteFromS3(fileUrl) {
//     try {
//       // Extract the key from the URL
//       const key = fileUrl.split(`${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`)[1]

//       if (!key) {
//         throw new Error("Invalid file URL")
//       }

//       const params = {
//         Bucket: process.env.AWS_S3_BUCKET,
//         Key: key,
//       }

//       return await this.s3.deleteObject(params).promise()
//     } catch (error) {
//       console.error("Error deleting from S3:", error)
//       throw error
//     }
//   }

//   /**
//    * Get multer middleware for image uploads
//    * @param {string} fieldName - Form field name
//    * @returns {Function} - Multer middleware
//    */
//   getImageUploadMiddleware(fieldName = "image") {
//     return this.uploadImage.single(fieldName)
//   }

//   /**
//    * Get multer middleware for document uploads
//    * @param {string} fieldName - Form field name
//    * @returns {Function} - Multer middleware
//    */
//   getDocumentUploadMiddleware(fieldName = "document") {
//     return this.uploadDocument.single(fieldName)
//   }

//   /**
//    * Get multer middleware for multiple image uploads
//    * @param {string} fieldName - Form field name
//    * @param {number} maxCount - Maximum number of files
//    * @returns {Function} - Multer middleware
//    */
//   getMultipleImageUploadMiddleware(fieldName = "images", maxCount = 5) {
//     return this.uploadImage.array(fieldName, maxCount)
//   }
// }

// module.exports = new FileUploadService()

