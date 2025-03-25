"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import "./Overlays.css"

interface WifiOverlayProps {
  isOpen: boolean
  onClose: () => void
  wifiSSID: string
  wifiPassword: string
}

const WifiOverlay: React.FC<WifiOverlayProps> = ({ isOpen, onClose, wifiSSID, wifiPassword }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && qrCodeRef.current) {
      // In a real implementation, you would generate a QR code here
      // using a library like qrcode.js
      const wifiQRData = `WIFI:S:${wifiSSID};T:${wifiPassword ? "WPA" : "nopass"};P:${wifiPassword};;`

      // Mock QR code generation for now
      qrCodeRef.current.innerHTML = `
        <div style="width: 150px; height: 150px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
          <span>QR Code for WiFi</span>
        </div>
      `
    }
  }, [isOpen, wifiSSID, wifiPassword])

  if (!isOpen) return null

  return (
    <div className="overlay">
      <div className="overlay-content wifi-overlay-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>WiFi Details</h2>
        <div ref={qrCodeRef} className="qr-code-container"></div>
        <div className="wifi-details">
          <div className="wifi-field">
            <label>SSID:</label>
            <span>{wifiSSID}</span>
          </div>
          {wifiPassword && (
            <div className="wifi-field">
              <label>Password:</label>
              <div className="password-field">
                <input type="password" value={wifiPassword} readOnly />
                <button className="password-toggle">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="password-copy">
                  <i className="fas fa-copy"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WifiOverlay

