"use client"

import type React from "react"
import { useState, useRef } from "react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import "./ImageCropper.css"

interface ImageCropperProps {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
  onCropComplete: (croppedImageUrl: string) => void
  aspectRatio?: number
}

const ImageCropper: React.FC<ImageCropperProps> = ({ isOpen, imageUrl, onClose, onCropComplete, aspectRatio = 1 }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  })

  const imageRef = useRef<HTMLImageElement | null>(null)

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imageRef.current = e.currentTarget

    // Set a reasonable initial crop that doesn't zoom too much
    const { width, height } = e.currentTarget
    let newWidth = 80 // Default to 80% of the image width
    let newHeight = newWidth / aspectRatio

    // Make sure the crop doesn't exceed the image bounds
    if (newHeight > 90) {
      newHeight = 90
      newWidth = newHeight * aspectRatio
    }

    setCrop({
      unit: "%",
      width: newWidth,
      height: newHeight,
      x: (100 - newWidth) / 2, // Center horizontally
      y: (100 - newHeight) / 2, // Center vertically
    })
  }

  // Crop the image to dataURL
  const getCroppedImg = (): string => {
    const img = imageRef.current
    if (!img) return ""

    const canvas = document.createElement("canvas")
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height
    const pixelRatio = window.devicePixelRatio

    const croppedWidth = (crop.width || 0) * scaleX * (img.width / 100)
    const croppedHeight = (crop.height || 0) * scaleY * (img.height / 100)

    canvas.width = croppedWidth * pixelRatio
    canvas.height = croppedHeight * pixelRatio

    const ctx = canvas.getContext("2d")
    if (!ctx) return ""

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = "high"

    const cropX = (crop.x || 0) * scaleX * (img.width / 100)
    const cropY = (crop.y || 0) * scaleY * (img.height / 100)

    ctx.drawImage(img, cropX, cropY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight)

    return canvas.toDataURL("image/jpeg", 0.95)
  }

  const handleCropComplete = () => {
    const croppedImageUrl = getCroppedImg()
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="cropper-overlay">
      <div className="cropper-modal">
        <div className="cropper-content">
          <h3>Crop Your Image</h3>
          {imageUrl && (
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={aspectRatio} keepSelection>
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxWidth: "100%" }}
              />
            </ReactCrop>
          )}
          <div className="cropper-actions">
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button onClick={handleCropComplete} className="crop-button">
              Crop & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageCropper

