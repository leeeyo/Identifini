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
  const qrCodeInstance = useRef<any>(null) // To store the QRCode instance

  useEffect(() => {
    if (isOpen && qrCodeRef.current) {
      // Clean up any existing QR code
      if (qrCodeInstance.current) {
        qrCodeInstance.current.clear()
      }

      // Dynamically import the QRCode library
      import("qrcode").then((QRCode) => {
        // Create canvas element
        const canvas = document.createElement("canvas")
        
        // Generate QR code
        QRCode.toCanvas(canvas, url, {
          width: 170,
          color: {
            dark: foregroundColor,
            light: "#ffffff00" // transparent background
          }
        }, (error) => {
          if (error) {
            console.error("Error generating QR code:", error)
            // Fallback display
            qrCodeRef.current!.innerHTML = `
              <div style="width: 170px; height: 170px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span>QR Code Error</span>
              </div>
            `
          } else {
            // Clear the container and append the canvas
            qrCodeRef.current!.innerHTML = ''
            qrCodeRef.current!.appendChild(canvas)
          }
        })
      }).catch(error => {
        console.error("Error loading QRCode library:", error)
        // Fallback display
        qrCodeRef.current!.innerHTML = `
          <div style="width: 170px; height: 170px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
            <span>QR Code Library Failed</span>
          </div>
        `
      })
    }

    // Cleanup function
    return () => {
      if (qrCodeInstance.current) {
        qrCodeInstance.current.clear()
      }
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