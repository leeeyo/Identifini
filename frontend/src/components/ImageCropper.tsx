"use client"

import type React from "react"
import { useState, useRef } from "react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-card rounded-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">Crop Your Image</h3>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-dark-input">
          {imageUrl && (
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={aspectRatio} keepSelection>
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-w-full max-h-[60vh] mx-auto"
              />
            </ReactCrop>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-dark-border flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-dark-active transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCropComplete}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageCropper

