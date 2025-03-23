"use client"

import React, { useEffect, useRef } from "react"

interface QRCodeOverlayProps {
  show: boolean
  onClose: () => void
  url: string
  themeColor: string
}

export default function QRCodeOverlay({ show, onClose, url, themeColor }: QRCodeOverlayProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (show && qrCodeRef.current && url && typeof window !== "undefined") {
      // Only import QRCode on the client side
      import("qrcode").then((QRCode) => {
        qrCodeRef.current!.innerHTML = ""
        QRCode.toCanvas(
          url,
          {
            width: 200,
            margin: 1,
            color: {
              dark: themeColor || "#000000",
              light: "#ffffff",
            },
          },
          (error: Error | null, canvas: HTMLCanvasElement) => {
            if (error) return console.error(error)
            qrCodeRef.current?.appendChild(canvas)
          },
        )
      })
    }
  }, [show, url, themeColor])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="self-end text-2xl leading-none mb-4">
          &times;
        </button>
        <div ref={qrCodeRef} className="qr-code-container"></div>
      </div>
    </div>
  )
}

