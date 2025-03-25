"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import "./Overlays.css"

interface MapOverlayProps {
  isOpen: boolean
  onClose: () => void
  latitude?: number
  longitude?: number
  address?: string
  customMapLink?: string
}

const MapOverlay: React.FC<MapOverlayProps> = ({ isOpen, onClose, latitude, longitude, address, customMapLink }) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && mapRef.current && latitude && longitude) {
      // In a real implementation, you would initialize a map here
      // using a library like Leaflet or Google Maps

      // Mock map for now
      mapRef.current.innerHTML = `
        <div style="width: 100%; height: 100%; background-color: #e0e0e0; display: flex; align-items: center; justify-content: center;">
          <span>Map at ${latitude}, ${longitude}</span>
        </div>
      `
    }
  }, [isOpen, latitude, longitude])

  if (!isOpen) return null

  // Determine the Google Maps URL
  const googleMapsUrl =
    customMapLink ||
    (address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : latitude && longitude
        ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        : "#")

  return (
    <div className="overlay">
      <div className="overlay-content map-overlay-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Location</h2>
        <div ref={mapRef} className="map-container"></div>
        <a href={googleMapsUrl} className="map-link" target="_blank" rel="noopener noreferrer">
          Open in Google Maps
        </a>
      </div>
    </div>
  )
}

export default MapOverlay

