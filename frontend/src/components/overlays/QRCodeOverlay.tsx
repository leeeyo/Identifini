"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import "./Overlays.css"

interface QRCodeOverlayProps {
  isOpen: boolean
  onClose: () => void
  url: string
  foregroundColor?: string
}

const QRCodeOverlay: React.FC<QRCodeOverlayProps> = ({ isOpen, onClose, url, foregroundColor = "#000000" }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && qrCodeRef.current) {
      // In a real implementation, you would generate a QR code here
      // using a library like qrcode.js

      // Mock QR code generation for now
      qrCodeRef.current.innerHTML = `
        <div style="width: 170px; height: 170px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
          <span>QR Code for URL</span>
        </div>
      `
    }
  }, [isOpen, url, foregroundColor])

  if (!isOpen) return null

  return (
    <div className="overlay">
      <div className="overlay-content qr-overlay-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Scan QR Code</h2>
        <div ref={qrCodeRef} className="qr-code-container"></div>
        <p>Scan this QR code to view this digital card</p>
      </div>
    </div>
  )
}

export default QRCodeOverlay

