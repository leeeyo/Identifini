"use client"

import type React from "react"
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
  // Determine the Google Maps URL for the "Open in Google Maps" button
  const googleMapsUrl =
    customMapLink ||
    (address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : latitude && longitude
        ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        : "#")

  // Create a Google Maps Static API URL
  // Note: In a production app, you would need to add your API key
  const staticMapUrl =
    latitude && longitude
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=600x300&markers=color:red%7C${latitude},${longitude}&key=YOUR_API_KEY`
      : ""

  // Create an OpenStreetMap URL as a fallback (no API key needed)
  const openStreetMapUrl =
    latitude && longitude
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`
      : ""

  if (!isOpen) return null

  return (
    <div className="overlay">
      <div className="overlay-content map-overlay-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Location</h2>

        <div className="map-container">
          {latitude && longitude ? (
            // Use an iframe with OpenStreetMap (no API key needed)
            <iframe
              src={openStreetMapUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0, borderRadius: "8px" }}
              allowFullScreen
              aria-hidden="false"
              tabIndex={0}
              title="Location Map"
            />
          ) : (
            // Fallback to static representation if no coordinates
            <div className="static-map-placeholder">
              <div className="map-info">
                {address && <p className="map-address">{address}</p>}
                <p>No map coordinates available</p>
              </div>
            </div>
          )}
        </div>

        <a href={googleMapsUrl} className="map-link" target="_blank" rel="noopener noreferrer">
          Open in Google Maps
        </a>
      </div>
    </div>
  )
}

export default MapOverlay

