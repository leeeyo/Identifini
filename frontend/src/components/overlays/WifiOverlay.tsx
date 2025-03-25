"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Icon } from "../IconWrapper"
import "./Overlays.css"

interface WifiOverlayProps {
  isOpen: boolean
  onClose: () => void
  wifiSSID: string
  wifiPassword: string
  showToast: (message: string) => void
}

const WifiOverlay: React.FC<WifiOverlayProps> = ({ isOpen, onClose, wifiSSID, wifiPassword, showToast }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const [passwordVisible, setPasswordVisible] = useState(false)

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

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)

    // Auto-hide password after 4 seconds
    if (!passwordVisible) {
      setTimeout(() => {
        setPasswordVisible(false)
      }, 4000)
    }
  }

  const copyPassword = () => {
    navigator.clipboard
      .writeText(wifiPassword)
      .then(() => showToast("Password copied!"))
      .catch(() => showToast("Failed to copy password."))
  }

  const sharePassword = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "WiFi Password",
          text: wifiPassword,
        })
      } catch (err) {
        showToast("Error sharing password")
      }
    } else {
      showToast("Sharing not supported in this browser")
    }
  }

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
                <input type={passwordVisible ? "text" : "password"} value={wifiPassword} readOnly />
                <button className="password-toggle" onClick={togglePasswordVisibility}>
                  {passwordVisible ? <Icon name="FaEyeSlash" /> : <Icon name="FaEye" />}
                </button>
                <button className="password-copy" onClick={copyPassword}>
                  <Icon name="FaCopy" />
                </button>
                <button className="password-share" onClick={sharePassword}>
                  <Icon name="FaShareAlt" />
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

