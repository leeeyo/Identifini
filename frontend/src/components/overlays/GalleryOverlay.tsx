"use client"

import type React from "react"
import { useState } from "react"
import "./Overlays.css"

interface GalleryOverlayProps {
  isOpen: boolean
  onClose: () => void
  photos: string[]
  initialIndex?: number
}

const GalleryOverlay: React.FC<GalleryOverlayProps> = ({ isOpen, onClose, photos, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (!isOpen) return null

  const nextImage = () => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
    }
  }

  const prevImage = () => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="overlay gallery-overlay">
      <div className="overlay-content gallery-overlay-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Gallery</h2>
        <div className="gallery-container">
          {photos.length > 0 ? (
            <>
              <div className="gallery-image-container">
                <img
                  src={photos[currentIndex] || "/placeholder.svg"}
                  alt={`Gallery item ${currentIndex + 1}`}
                  className="gallery-image"
                />
              </div>
              <div className="gallery-controls">
                <button className="gallery-nav prev" onClick={prevImage}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="gallery-indicators">
                  {photos.map((_photo: string, index: number) => (
                    <span
                      key={index}
                      className={`indicator ${index === currentIndex ? "active" : ""}`}
                      onClick={() => goToImage(index)}
                    ></span>
                  ))}
                </div>
                <button className="gallery-nav next" onClick={nextImage}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </>
          ) : (
            <p className="no-photos">No photos available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default GalleryOverlay

