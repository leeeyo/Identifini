"use client"

import { useState, useEffect } from "react"

interface GalleryOverlayProps {
  show: boolean
  onClose: () => void
  photos: string[]
  themeColor1: string
  themeColor2: string
  themeColor3: string
}

export default function GalleryOverlay({
  show,
  onClose,
  photos,
  themeColor1,
  themeColor2,
  themeColor3,
}: GalleryOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    // Ensure the gallery is reset to the first slide when it's opened
    if (show) {
      setCurrentSlide(0)
    }
  }, [show])

  if (!show) return null

  const showSlide = (index: number) => {
    const newIndex = (index + photos.length) % photos.length
    setCurrentSlide(newIndex)
  }

  const goToPrevSlide = () => {
    showSlide(currentSlide - 1)
  }

  const goToNextSlide = () => {
    showSlide(currentSlide + 1)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" style={{ display: show ? "block" : "none" }}>
      <div
        className="gallery-gradient-overlay absolute inset-0"
        style={{
          background: `linear-gradient(-45deg, ${themeColor1}, ${themeColor2})`,
          backgroundSize: "400% 400%",
          animation: "gradientBG 15s ease infinite",
        }}
      />

      <div className="gallery-content relative z-10 w-full h-full flex justify-center items-center">
        {photos.length > 0 ? (
          <>
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vmin] h-[90vmin] bg-cover bg-no-repeat bg-center rounded-xl transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundImage: `url(${photo})` }}
              />
            ))}

            <button
              className="absolute top-1/2 left-5 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20"
              style={{ background: themeColor2, color: themeColor3, border: `1px solid ${themeColor3}` }}
              onClick={goToPrevSlide}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <button
              className="absolute top-1/2 right-5 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20"
              style={{ background: themeColor2, color: themeColor3, border: `1px solid ${themeColor3}` }}
              onClick={goToNextSlide}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>

            <button
              className="fixed top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center z-20"
              style={{ background: themeColor2, color: themeColor3, border: `1px solid ${themeColor3}` }}
              onClick={onClose}
            >
              <i className="fa-solid fa-times"></i>
            </button>

            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentSlide ? "opacity-100" : "opacity-50"}`}
                  style={{ background: themeColor3 }}
                  onClick={() => showSlide(index)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-xl text-white">
            No photos available.
          </div>
        )}
      </div>
    </div>
  )
}
