"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faWhatsapp,
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
  faYoutube,
  faTiktok,
  faPinterest,
} from "@fortawesome/free-brands-svg-icons"
import {
  faEnvelope,
  faPhone,
  faComment,
  faPaperclip,
  faMapMarkerAlt,
  faWifi,
  faQrcode,
  faImages,
} from "@fortawesome/free-solid-svg-icons"
import MapOverlay from "./overlays/Map"
import QRCodeOverlay from "./overlays/QRCodeOverlay"
import WifiOverlay from "./overlays/WifiOverlay"
import GalleryOverlay from "./overlays/Gallery"
import "qrcode.react"

import "./CardPage.css"

interface SocialMedia {
  icon: string
  link: string
}

interface ActionButton {
  icon?: string
  text: string
  link: string
}

interface FloatingAction {
  type: string
  contact: string
  link: string
}

interface Card {
  display_name: string
  card_pic: string
  display_address: string
  bio: string
  theme_color_1: string
  theme_color_2: string
  theme_color_3: string
  social_medias: SocialMedia[]
  action_buttons: ActionButton[]
  floating_actions: FloatingAction[]
  latitude?: number
  longitude?: number
  custom_map_link?: string
  card_wifi_ssid?: string
  card_wifi_password?: string
  extra_photos?: string[]
}

const CardPage: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFloatingActions, setShowFloatingActions] = useState(false)

  // Overlay states
  const [showMapOverlay, setShowMapOverlay] = useState(false)
  const [showQRCodeOverlay, setShowQRCodeOverlay] = useState(false)
  const [showWifiOverlay, setShowWifiOverlay] = useState(false)
  const [showGalleryOverlay, setShowGalleryOverlay] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8080/api/cards/${username}`)

        if (!response.ok) {
          throw new Error(response.status === 404 ? "Card not found" : "Failed to load card")
        }

        const data = await response.json()

        // Parse JSON strings if they come as strings from the API
        if (typeof data.social_medias === "string") {
          data.social_medias = JSON.parse(data.social_medias)
        }

        if (typeof data.action_buttons === "string") {
          data.action_buttons = JSON.parse(data.action_buttons)
        }

        if (typeof data.floating_actions === "string") {
          data.floating_actions = JSON.parse(data.floating_actions)
        }

        if (typeof data.extra_photos === "string") {
          data.extra_photos = JSON.parse(data.extra_photos)
        }

        setCard(data)
      } catch (err: any) {
        console.error("Error fetching card:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCard()
  }, [username])

  // Helper function to display toast messages
  const displayToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Check if app is running in standalone mode (PWA)
  const isAppStandalone = () => {
    return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
  }

  // Show tutorial for installing PWA
  const showPWATutorial = () => {
    displayToast("Add to home screen for full features")
  }

  // Helper function to get the appropriate FontAwesome icon
  const getIcon = (iconName?: string) => {
    if (!iconName) return faPaperclip

    // Handle both "fa-brands fa-facebook" and "facebook" formats
    const iconKey = iconName.includes("fa-") ? iconName.split("fa-").pop() : iconName.toLowerCase()

    switch (iconKey) {
      case "facebook":
        return faFacebook
      case "instagram":
        return faInstagram
      case "twitter":
        return faTwitter
      case "linkedin":
        return faLinkedin
      case "youtube":
        return faYoutube
      case "tiktok":
        return faTiktok
      case "pinterest":
        return faPinterest
      case "whatsapp":
        return faWhatsapp
      case "envelope":
        return faEnvelope
      case "phone":
        return faPhone
      case "comment":
        return faComment
      case "paperclip":
        return faPaperclip
      default:
        return faPaperclip // Default icon
    }
  }

  // Helper function to get floating action icon
  const getFloatingActionIcon = (type: string) => {
    switch (type) {
      case "Whatsapp":
        return faWhatsapp
      case "SMS":
        return faComment
      case "Call":
        return faPhone
      case "Email":
        return faEnvelope
      default:
        return faPaperclip
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="error-container">
        <h2>Card Not Found</h2>
        <p>The digital card you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  // Apply theme colors from the card data
  const cardStyle = {
    "--theme-color-1": card.theme_color_1 || "#f58529",
    "--theme-color-2": card.theme_color_2 || "#dd2a7b",
    "--theme-color-3": card.theme_color_3 || "#8134af",
  } as React.CSSProperties

  // Get current URL for QR code
  const currentUrl = window.location.href

  return (
    <div className="card-page" style={cardStyle}>
      <div className="card-container">
        <div className="card-header">
          {card.card_pic && (
            <div className="profile-pic-container">
              <img
                src={card.card_pic || "/placeholder.svg"}
                alt={`${card.display_name}'s profile`}
                className="profile-pic"
              />
            </div>
          )}

          <h1 className="card-name">{card.display_name}</h1>

          {card.display_address && (
            <p className="card-address">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="address-icon" />
              {card.display_address}
            </p>
          )}
        </div>

        {/* Feature Buttons Row */}
        <div className="feature-buttons">
          {/* Map Button - Only show if latitude and longitude are available */}
          {card.latitude && card.longitude && (
            <button className="feature-button" onClick={() => setShowMapOverlay(true)} aria-label="View on map">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>Map</span>
            </button>
          )}

          {/* QR Code Button */}
          <button className="feature-button" onClick={() => setShowQRCodeOverlay(true)} aria-label="Show QR code">
            <FontAwesomeIcon icon={faQrcode} />
            <span>QR Code</span>
          </button>

          {/* WiFi Button - Only show if WiFi credentials are available */}
          {card.card_wifi_ssid && (
            <button className="feature-button" onClick={() => setShowWifiOverlay(true)} aria-label="WiFi details">
              <FontAwesomeIcon icon={faWifi} />
              <span>WiFi</span>
            </button>
          )}

          {/* Gallery Button - Only show if extra photos are available */}
          {card.extra_photos && card.extra_photos.length > 0 && (
            <button className="feature-button" onClick={() => setShowGalleryOverlay(true)} aria-label="View gallery">
              <FontAwesomeIcon icon={faImages} />
              <span>Gallery</span>
            </button>
          )}
        </div>

        {card.bio && (
          <div className="card-bio">
            <p>{card.bio}</p>
          </div>
        )}

        {card.social_medias && card.social_medias.length > 0 && (
          <div className="social-media-container">
            {card.social_medias.map((social, index) => (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-link"
                aria-label={`Visit ${social.icon.split("fa-").pop() || "social media"}`}
              >
                <FontAwesomeIcon icon={getIcon(social.icon)} />
              </a>
            ))}
          </div>
        )}

        {card.action_buttons && card.action_buttons.length > 0 && (
          <div className="action-buttons-container">
            {card.action_buttons.map((button, index) => (
              <a key={index} href={button.link} target="_blank" rel="noopener noreferrer" className="action-button">
                <FontAwesomeIcon icon={getIcon(button.icon)} className="action-icon" />
                <span>{button.text}</span>
              </a>
            ))}
          </div>
        )}

        {/* Floating Actions Toggle Button */}
        {card.floating_actions && card.floating_actions.length > 0 && (
          <>
            <button
              className="floating-toggle-button"
              onClick={() => setShowFloatingActions(!showFloatingActions)}
              aria-label="Toggle contact options"
            >
              <FontAwesomeIcon icon={faPhone} />
            </button>

            {/* Floating Actions Menu */}
            <div className={`floating-actions-menu ${showFloatingActions ? "show" : ""}`}>
              {card.floating_actions.map((action, index) => (
                <a
                  key={index}
                  href={action.link}
                  className="floating-action-item"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={getFloatingActionIcon(action.type)} />
                  <span>{action.type}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="card-footer">
        <p>Powered by Identifini</p>
      </footer>

      {/* Toast Notification */}
      <div className={`toast-notification ${showToast ? "show" : ""}`}>{toastMessage}</div>

      {/* Map Overlay */}
      <MapOverlay
        show={showMapOverlay}
        onClose={() => setShowMapOverlay(false)}
        latitude={card.latitude}
        longitude={card.longitude}
        fullAddress={card.display_address}
        customMapLink={card.custom_map_link}
      />

      {/* QR Code Overlay */}
      <QRCodeOverlay
        show={showQRCodeOverlay}
        onClose={() => setShowQRCodeOverlay(false)}
        url={currentUrl}
        themeColor={card.theme_color_1}
      />

      {/* WiFi Overlay */}
      {card.card_wifi_ssid && (
        <WifiOverlay
          show={showWifiOverlay}
          onClose={() => setShowWifiOverlay(false)}
          wifiSSID={card.card_wifi_ssid}
          wifiPassword={card.card_wifi_password || ""}
          themeColor={card.theme_color_1}
          displayToast={displayToast}
          isAppStandalone={isAppStandalone}
          onShowTutorial={showPWATutorial}
        />
      )}

      {/* Gallery Overlay */}
      {card.extra_photos && (
        <GalleryOverlay
          show={showGalleryOverlay}
          onClose={() => setShowGalleryOverlay(false)}
          photos={card.extra_photos}
          themeColor1={card.theme_color_1}
          themeColor2={card.theme_color_2}
          themeColor3={card.theme_color_3}
        />
      )}
    </div>
  )
}

export default CardPage

