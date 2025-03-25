"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "./Overlays.css"
import * as FaIcons from "react-icons/fa"

interface GalleryOverlayProps {
  isOpen: boolean
  onClose: () => void
  photos: string[]
  initialIndex?: number
}

const GalleryOverlay: React.FC<GalleryOverlayProps> = ({ isOpen, onClose, photos, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

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
      <div className="gallery-gradient-overlay"></div>
      <div className="overlay-content gallery-overlay-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <div className="gallery-container">
          {photos.length > 0 ? (
            <>
              <div className="gallery-slides">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className={`gallery-slide ${index === currentIndex ? "active" : ""}`}
                    style={{
                      backgroundImage: `url(${photo || "/placeholder.svg"})`,
                      display: index === currentIndex ? "block" : "none",
                    }}
                  />
                ))}
              </div>

              <div className="gallery-controls">
                <button className="gallery-nav prev" onClick={prevImage}>
                  <FaIcons.FaChevronLeft />
                </button>

                <div className="gallery-indicators">
                  {photos.map((_photo, index) => (
                    <span
                      key={index}
                      className={`gallery-indicator ${index === currentIndex ? "active" : ""}`}
                      onClick={() => goToImage(index)}
                    />
                  ))}
                </div>

                <button className="gallery-nav next" onClick={nextImage}>
                  <FaIcons.FaChevronRight />
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

