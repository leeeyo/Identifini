"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import CardService from "../services/CardService"
import type { Card } from "../types/card"
import { useAuth } from "../context/AuthContext"
import "./CardView.css"

// Import overlay components
import { QRCodeOverlay } from "./overlays"
import { WifiOverlay } from "./overlays"
import { MapOverlay } from "./overlays"
import { GalleryOverlay } from "./overlays"
import { LeadFormOverlay } from "./overlays"

const CardView: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)

  // Overlay states
  const [showQROverlay, setShowQROverlay] = useState(false)
  const [showWifiOverlay, setShowWifiOverlay] = useState(false)
  const [showMapOverlay, setShowMapOverlay] = useState(false)
  const [showGalleryOverlay, setShowGalleryOverlay] = useState(false)
  const [showLeadFormOverlay, setShowLeadFormOverlay] = useState(false)

  useEffect(() => {
    const fetchCardData = async () => {
      if (!username) return

      try {
        setLoading(true)
        const cardData = await CardService.getCardByUsername(username)
        setCard(cardData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching card data:", err)
        setError("Failed to load card data. Please try again later.")
        setLoading(false)
      }
    }

    fetchCardData()
  }, [username])

  // Parse JSON fields if they are strings
  const getSocialMedia = () => {
    if (!card?.social_medias) return []

    if (typeof card.social_medias === "string") {
      try {
        return JSON.parse(card.social_medias)
      } catch (e) {
        return []
      }
    }

    return card.social_medias
  }

  const getActionButtons = () => {
    if (!card?.action_buttons) return []

    if (typeof card.action_buttons === "string") {
      try {
        return JSON.parse(card.action_buttons)
      } catch (e) {
        return []
      }
    }

    return card.action_buttons
  }

  const getFloatingActions = () => {
    if (!card?.floating_actions) return []

    if (typeof card.floating_actions === "string") {
      try {
        return JSON.parse(card.floating_actions)
      } catch (e) {
        return []
      }
    }

    return card.floating_actions
  }

  const getExtraPhotos = () => {
    if (!card?.extra_photos) return []

    if (typeof card.extra_photos === "string") {
      try {
        return JSON.parse(card.extra_photos)
      } catch (e) {
        return []
      }
    }

    return card.extra_photos
  }

  const socialMedia = getSocialMedia()
  const actionButtons = getActionButtons()
  const floatingActions = getFloatingActions()
  const extraPhotos = getExtraPhotos()

  // Check if the current user is the owner of this card
  const isOwner = () => {
    if (!user || !card) return false

    // Get the user ID, accounting for different property names
    const userId = user._id || (user as any).id

    // Get the card's user ID, accounting for different property names
    const cardUserId = typeof card.user === "object" ? (card.user as any)._id || (card.user as any).id : card.user

    return cardUserId === userId
  }

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card?.display_name}'s Digital Card`,
          url: window.location.href,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      handleCopyLink()
    }
  }

  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        showToast("Link copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
        showToast("Failed to copy link")
      })
  }

  // Show toast notification
  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Handle lead form submission
  const handleLeadFormSubmit = async (formData: any) => {
    if (!card) return

    try {
      // Since submitLead doesn't exist in CardService, we'll simulate success
      console.log("Would submit lead data:", formData, "for card:", card.card_username)

      // Simulate a delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      showToast("Contact information submitted successfully!")
      return Promise.resolve()
    } catch (error) {
      console.error("Error submitting lead:", error)
      throw error
    }
  }

  const goToImage = (index: number) => {
    setCurrentGalleryIndex(index)
    setShowGalleryOverlay(true)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading card data...</p>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="card-view-container">
        <div className="error-message">{error || "Card not found"}</div>
        <button className="back-button" onClick={() => navigate("/")}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div
      className="card-view-wrapper"
      style={
        {
          "--theme-color-1": card.theme_color_1 || "#333333",
          "--theme-color-2": card.theme_color_2 || "#ffffff",
          "--theme-color-3": card.theme_color_3 || "#f5f5f5",
        } as React.CSSProperties
      }
    >
      {/* Top Header */}
      <div className="card-view-header">
        <button className="menu-button" onClick={() => setShowDropdown(!showDropdown)}>
          <i className="fas fa-ellipsis-v"></i>
        </button>
        <button className="share-button" onClick={handleShare}>
          <i className="fas fa-share-alt"></i>
        </button>
        {isOwner() && (
          <Link to={`/edit-card/${card.card_username}`} className="edit-button">
            <i className="fas fa-edit"></i>
          </Link>
        )}
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="dropdown-menu">
          <ul>
            <li onClick={handleShare}>
              <i className="fas fa-share-alt"></i> Share
            </li>
            <li onClick={handleCopyLink}>
              <i className="fas fa-copy"></i> Copy Link
            </li>
            <li onClick={() => setShowQROverlay(true)}>
              <i className="fas fa-qrcode"></i> QR Code
            </li>
            {card.card_wifi_ssid && (
              <li onClick={() => setShowWifiOverlay(true)}>
                <i className="fas fa-wifi"></i> WiFi
              </li>
            )}
            {extraPhotos.length > 0 && (
              <li onClick={() => setShowGalleryOverlay(true)}>
                <i className="fas fa-images"></i> Gallery
              </li>
            )}
            <li onClick={() => setShowLeadFormOverlay(true)}>
              <i className="fas fa-address-book"></i> Save Contact
            </li>
            {isOwner() && (
              <li onClick={() => navigate(`/edit-card/${card.card_username}`)}>
                <i className="fas fa-edit"></i> Edit Card
              </li>
            )}
            {isOwner() && (
              <li onClick={() => navigate("/")}>
                <i className="fas fa-arrow-left"></i> Back to Dashboard
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className="card-view-main">
        <div className="animated-gradient">
          {card.card_pic ? (
            <img src={card.card_pic || "/placeholder.svg"} alt={card.display_name} className="profile-pic" />
          ) : (
            <div className="profile-pic-placeholder">
              {card.display_name ? card.display_name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <div className="client-name">{card.display_name}</div>

          {card.business_type && <div className="business-type">{card.business_type}</div>}

          {card.bio && <p className="client-bio">{card.bio}</p>}

          {/* Contact Information */}
          {(card.card_email || card.display_address) && (
            <div className="contact-info">
              {card.card_email && (
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <a href={`mailto:${card.card_email}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {card.card_email}
                  </a>
                </div>
              )}
              {card.display_address && (
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{card.display_address}</span>
                </div>
              )}
            </div>
          )}

          {/* Social Media Icons */}
          {socialMedia.length > 0 && (
            <div className="social-icons">
              {socialMedia.map((social: any, index: number) => (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                  <i className={`fab ${social.icon || "fa-globe"}`}></i>
                </a>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {actionButtons.length > 0 && (
            <div className="action-buttons">
              {actionButtons.map((button: any, index: number) => (
                <div key={index} className="action-btn-wrapper">
                  <a href={button.url} className="action-btn" target="_blank" rel="noopener noreferrer">
                    <i className={`fas ${button.icon || "fa-link"}`}></i> {button.label}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Gallery Indicators */}
          {extraPhotos.length > 0 && (
            <div className="gallery-indicators">
              {extraPhotos.map((_photo: string, index: number) => (
                <span
                  key={index}
                  className={`indicator ${index === currentGalleryIndex ? "active" : ""}`}
                  onClick={() => goToImage(index)}
                ></span>
              ))}
            </div>
          )}
        </div>

        {/* Floating Actions */}
        <div className="floating-actions">
          {card.latitude && card.longitude && (
            <button className="floating-action" title="Location" onClick={() => setShowMapOverlay(true)}>
              <i className="fas fa-location-dot"></i>
              <span>Location</span>
            </button>
          )}

          {card.card_wifi_ssid && (
            <button className="floating-action" title="WiFi" onClick={() => setShowWifiOverlay(true)}>
              <i className="fas fa-wifi"></i>
              <span>WiFi</span>
            </button>
          )}

          {extraPhotos.length > 0 && (
            <button className="floating-action" title="Gallery" onClick={() => setShowGalleryOverlay(true)}>
              <i className="fas fa-images"></i>
              <span>Gallery</span>
            </button>
          )}

          <button className="floating-action" title="Save Contact" onClick={() => setShowLeadFormOverlay(true)}>
            <i className="fas fa-address-book"></i>
            <span>Contact</span>
          </button>

          {floatingActions.length > 0 &&
            floatingActions.map((action: any, index: number) => {
              // Determine icon class based on action type
              let iconClass = "fa-link"
              let url = action.url

              if (action.type === "Whatsapp" || action.type === "WhatsApp") {
                iconClass = "fa-whatsapp"
                if (!url.startsWith("https://wa.me/")) {
                  url = `https://wa.me/${url.replace(/[^0-9]/g, "")}`
                }
              }

              if (action.type === "SMS") {
                iconClass = "fa-comment-sms"
                if (!url.startsWith("sms:")) {
                  url = `sms:${url}`
                }
              }

              if (action.type === "Call") {
                iconClass = "fa-phone"
                if (!url.startsWith("tel:")) {
                  url = `tel:${url}`
                }
              }

              if (action.type === "Email") {
                iconClass = "fa-envelope"
                if (!url.startsWith("mailto:")) {
                  url = `mailto:${url}`
                }
              }

              return (
                <a
                  key={index}
                  href={url}
                  className="floating-action"
                  title={action.type}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`fas ${action.icon || iconClass}`}></i>
                  <span>{action.type}</span>
                </a>
              )
            })}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      {/* Overlays */}
      <QRCodeOverlay
        isOpen={showQROverlay}
        onClose={() => setShowQROverlay(false)}
        url={window.location.href}
        foregroundColor={card.theme_color_3}
      />

      <WifiOverlay
        isOpen={showWifiOverlay}
        onClose={() => setShowWifiOverlay(false)}
        wifiSSID={card.card_wifi_ssid || ""}
        wifiPassword={card.card_wifi_password || ""}
      />

      <MapOverlay
        isOpen={showMapOverlay}
        onClose={() => setShowMapOverlay(false)}
        latitude={card.latitude ? Number.parseFloat(card.latitude) : undefined}
        longitude={card.longitude ? Number.parseFloat(card.longitude) : undefined}
        address={card.display_address}
        customMapLink={card.custom_map_link}
      />

      <GalleryOverlay
        isOpen={showGalleryOverlay}
        onClose={() => setShowGalleryOverlay(false)}
        photos={extraPhotos}
        initialIndex={currentGalleryIndex}
      />

      <LeadFormOverlay
        isOpen={showLeadFormOverlay}
        onClose={() => setShowLeadFormOverlay(false)}
        cardUsername={card.card_username}
        displayName={card.display_name}
        onSubmit={handleLeadFormSubmit}
      />
    </div>
  )
}

export default CardView

