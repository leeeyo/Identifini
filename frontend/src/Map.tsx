"use client"

import React, { useEffect, useState } from "react"
import { MapContainer, Marker, TileLayer, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

interface MapOverlayProps {
  show: boolean
  onClose: () => void
  latitude?: number
  longitude?: number
  fullAddress?: string
  customMapLink?: string
}

// Default position if no coordinates are provided
const defaultPosition = { lat: 37.7749, lng: -122.4194 } // Default to San Francisco

export default function MapOverlay({
  show,
  onClose,
  latitude,
  longitude,
  fullAddress,
  customMapLink,
}: MapOverlayProps) {
  const [currentPosition, setCurrentPosition] = useState(defaultPosition)

  // Handle latitude and longitude updates
  useEffect(() => {
    if (latitude && longitude) {
      setCurrentPosition({ lat: latitude, lng: longitude })
    }
  }, [latitude, longitude])

  if (!show || !latitude || !longitude) return null

  // Google Maps URL (if needed)
  let googleMapsUrl = ""
  if (customMapLink && customMapLink.trim() !== "") {
    googleMapsUrl = customMapLink
  } else if (fullAddress && fullAddress.trim() !== "") {
    googleMapsUrl = `https://www.openstreetmap.org/?mlat=${currentPosition.lat}&mlon=${currentPosition.lng}`
  } else {
    googleMapsUrl = `https://www.openstreetmap.org/?mlat=${currentPosition.lat}&mlon=${currentPosition.lng}`
  }

  // Fix Leaflet marker icon issue by setting the default icon manually
  const defaultIcon = L.icon({
    iconUrl: "/marker-icon.png", // Ensure this icon is in the public folder
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

  // Using useMap hook to handle map state updates
  const MapUpdate = () => {
    const map = useMap() // hook to get the map instance
    useEffect(() => {
      if (latitude && longitude) {
        map.setView([latitude, longitude], 15) // Set the map view when coordinates are available
      }
    }, [map])
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md text-xl"
        >
          &times;
        </button>

        <div className="h-full w-full">
          <MapContainer
            center={currentPosition}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <MapUpdate />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={currentPosition} icon={defaultIcon}>
              <Popup>{fullAddress || "Location"}</Popup>
            </Marker>
          </MapContainer>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md"
        >
          View in OSM
        </a>
      </div>
    </div>
  )
}
