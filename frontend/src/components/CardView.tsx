"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import CardService from "../services/CardService"
import type { Card } from "../types/card"
import { useAuth } from "../context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
// Import Lucide icons
import {
  Menu,
  Share2,
  Copy,
  QrCode,
  Wifi,
  Images,
  UserPlus,
  Download,
  Edit,
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  LinkIcon,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Github,
  Dribbble,
  Globe,
  ExternalLink,
  Star,
  FileText,
  MapIcon,
  Save,
  CreditCard,
  MessageCircle,
} from "lucide-react"

// Import overlay components
import QRCodeOverlay from "./overlays/QRCodeOverlay"
import WifiOverlay from "./overlays/WifiOverlay"
import MapOverlay from "./overlays/MapOverlay"
import GalleryOverlay from "./overlays/GalleryOverlay"
import LeadFormOverlay from "./overlays/LeadFormOverlay"

// Define types for floating actions
interface FloatingAction {
  type: string
  url: string
  icon?: string
}

// Define types for social media
interface SocialMedia {
  platform: string
  url: string
  icon?: string
}

// Define types for action buttons
interface ActionButton {
  label: string
  url: string
  icon?: string
}

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
  const [activeTab, setActiveTab] = useState<"home" | "menu">("home")

  // Overlay states
  const [showQROverlay, setShowQROverlay] = useState(false)
  const [showWifiOverlay, setShowWifiOverlay] = useState(false)
  const [showMapOverlay, setShowMapOverlay] = useState(false)
  const [showGalleryOverlay, setShowGalleryOverlay] = useState(false)
  const [showLeadFormOverlay, setShowLeadFormOverlay] = useState(false)

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Parse JSON fields if they are strings
  const getSocialMedia = (): SocialMedia[] => {
    if (!card?.social_medias) return []

    if (typeof card.social_medias === "string") {
      try {
        return JSON.parse(card.social_medias)
      } catch (e) {
        return []
      }
    }

    return card.social_medias as SocialMedia[]
  }

  const getActionButtons = (): ActionButton[] => {
    if (!card?.action_buttons) return []

    if (typeof card.action_buttons === "string") {
      try {
        return JSON.parse(card.action_buttons)
      } catch (e) {
        return []
      }
    }

    return card.action_buttons as ActionButton[]
  }

  const getFloatingActions = (): FloatingAction[] => {
    if (!card?.floating_actions) return []

    if (typeof card.floating_actions === "string") {
      try {
        return JSON.parse(card.floating_actions)
      } catch (e) {
        return []
      }
    }

    return card.floating_actions as FloatingAction[]
  }

  const getExtraPhotos = (): string[] => {
    if (!card?.extra_photos) return []

    if (typeof card.extra_photos === "string") {
      try {
        return JSON.parse(card.extra_photos)
      } catch (e) {
        return []
      }
    }

    return card.extra_photos as string[]
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
      // Submit lead data to the API
      await CardService.submitLead(card.card_username, formData)
      showToast("Contact information submitted successfully!")

      // Download vCard after successful submission
      setTimeout(() => {
        handleDownloadVCard()
      }, 1000)

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

  // Handle vCard download
  const handleDownloadVCard = () => {
    if (!card) return

    // Create a direct download link to the vCard endpoint
    const vCardUrl = `/api/cards/username/${card.card_username}/vcard`

    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a")
    link.href = vCardUrl
    link.download = `${card.display_name}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast("Contact card downloading...")
  }

  // Get social media icon component
  const getSocialIcon = (platform: string): React.ReactNode => {
    const platformLower = platform.toLowerCase()

    if (platformLower.includes("instagram")) return <Instagram size={20} />
    if (platformLower.includes("facebook")) return <Facebook size={20} />
    if (platformLower.includes("twitter")) return <Twitter size={20} />
    if (platformLower.includes("linkedin")) return <Linkedin size={20} />
    if (platformLower.includes("youtube")) return <Youtube size={20} />
    if (platformLower.includes("github")) return <Github size={20} />
    if (platformLower.includes("dribbble")) return <Dribbble size={20} />

    return <Globe size={20} />
  }

  // Helper function to get the correct URL for floating actions
  const getFloatingActionUrl = (action: FloatingAction): string => {
    let url = action.url

    if (action.type === "Whatsapp" || action.type === "WhatsApp") {
      if (!url.startsWith("https://wa.me/")) {
        url = `https://wa.me/${url.replace(/[^0-9]/g, "")}`
      }
    } else if (action.type === "SMS") {
      if (!url.startsWith("sms:")) {
        url = `sms:${url}`
      }
    } else if (action.type === "Call") {
      if (!url.startsWith("tel:")) {
        url = `tel:${url}`
      }
    } else if (action.type === "Email") {
      if (!url.startsWith("mailto:")) {
        url = `mailto:${url}`
      }
    }

    return url
  }

  // Helper function to get the correct icon for floating actions
  const getFloatingActionIcon = (action: FloatingAction): React.ReactNode => {
    if (action.type === "Whatsapp" || action.type === "WhatsApp") {
      return <MessageCircle size={20} />
    } else if (action.type === "SMS") {
      return <MessageSquare size={20} />
    } else if (action.type === "Call") {
      return <Phone size={20} />
    } else if (action.type === "Email") {
      return <Mail size={20} />
    }

    return <LinkIcon size={20} />
  }

  // Get action button icon
  const getActionButtonIcon = (label: string): React.ReactNode => {
    const labelLower = label.toLowerCase()

    if (labelLower.includes("review")) return <Star size={18} />
    if (labelLower.includes("menu")) return <FileText size={18} />
    if (labelLower.includes("location") || labelLower.includes("map")) return <MapIcon size={18} />
    if (labelLower.includes("contact")) return <UserPlus size={18} />
    if (labelLower.includes("website")) return <ExternalLink size={18} />

    return <LinkIcon size={18} />
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading card data...</p>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{error || "Card not found"}</h2>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Define theme colors from card
  const themeColor1 = card.theme_color_1 || "#009688" // Default to teal if not set
  const themeColor2 = card.theme_color_2 || "#ffffff"
  const themeColor3 = card.theme_color_3 || "#333333"

  // Find call, email, and SMS actions
  const callAction = floatingActions.find((action) => action.type === "Call")
  const emailAction = floatingActions.find((action) => action.type === "Email")
  const smsAction = floatingActions.find((action) => action.type === "SMS")

  // Create default action buttons if none exist
  const defaultActionButtons =
    actionButtons.length > 0
      ? actionButtons
      : [
          { label: "Review Us", url: "#", icon: "star" },
          { label: "View Menu", url: "#", icon: "menu" },
          { label: "Test Button", url: "#", icon: "link" },
        ]

  return (
    <div className="relative min-h-screen flex flex-col font-sans overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg z-50 shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <div
          className="absolute inset-0 w-full h-full animated-gradient"
          style={{
            backgroundColor: themeColor1,
            backgroundImage: `
              radial-gradient(at 40% 20%, ${themeColor1} 0px, transparent 50%),
              radial-gradient(at 80% 0%, rgba(255, 255, 255, 0.1) 0px, transparent 50%),
              radial-gradient(at 0% 50%, rgba(255, 255, 255, 0.1) 0px, transparent 50%),
              radial-gradient(at 80% 50%, ${themeColor1} 0px, transparent 50%),
              radial-gradient(at 0% 100%, rgba(255, 255, 255, 0.1) 0px, transparent 50%),
              radial-gradient(at 80% 100%, ${themeColor1} 0px, transparent 50%),
              radial-gradient(at 0% 0%, rgba(255, 255, 255, 0.1) 0px, transparent 50%)
            `,
          }}
        ></div>
      </div>

      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 flex justify-between p-4 z-40">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-white/90 transition-all"
          style={{ color: themeColor1 }}
        >
          <Menu size={18} />
        </button>

        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-white/90 transition-all"
          style={{ color: themeColor1 }}
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-4 rounded-xl shadow-xl z-50 w-64 overflow-hidden"
            style={{ backgroundColor: themeColor1 }}
          >
            <ul className="py-1">
              <li
                onClick={handleShare}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
              >
                <Share2 size={18} />
                <span>Share</span>
              </li>
              <li
                onClick={handleCopyLink}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
              >
                <Copy size={18} />
                <span>Copy Link</span>
              </li>
              <li
                onClick={() => setShowQROverlay(true)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
              >
                <QrCode size={18} />
                <span>QR Code</span>
              </li>

              {card.card_wifi_ssid && (
                <li
                  onClick={() => setShowWifiOverlay(true)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
                >
                  <Wifi size={18} />
                  <span>WiFi</span>
                </li>
              )}

              {extraPhotos.length > 0 && (
                <li
                  onClick={() => setShowGalleryOverlay(true)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
                >
                  <Images size={18} />
                  <span>Gallery</span>
                </li>
              )}

              <li
                onClick={() => setShowLeadFormOverlay(true)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
              >
                <UserPlus size={18} />
                <span>Save Contact</span>
              </li>

              <li
                onClick={handleDownloadVCard}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
              >
                <Download size={18} />
                <span>Download vCard</span>
              </li>

              {isOwner() && (
                <>
                  <li
                    onClick={() => navigate(`/edit-card/${card.card_username}`)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
                  >
                    <Edit size={18} />
                    <span>Edit Card</span>
                  </li>

                  <li
                    onClick={() => navigate("/")}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
                  >
                    <ArrowLeft size={18} />
                    <span>Back to Dashboard</span>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center pt-16 pb-24 z-10 relative">
        <div className="w-full max-w-md flex flex-col items-center px-4">
          {/* Profile Picture */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="mb-6"
          >
            {card.card_pic ? (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden">
                <img
                  src={card.card_pic || "/placeholder.svg"}
                  alt={card.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-5xl font-bold border-4 border-white shadow-xl"
                style={{ color: themeColor1 }}
              >
                {card.display_name ? card.display_name.charAt(0).toUpperCase() : "?"}
              </div>
            )}
          </motion.div>

          {/* Name and Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 w-full text-center"
          >
            <h1 className="text-3xl font-bold mb-2 text-white">{card.display_name}</h1>

            {card.bio && <p className="text-base text-white/90 max-w-md mx-auto mb-6 leading-relaxed">{card.bio}</p>}
          </motion.div>

          {/* Contact Information */}
          {(card.card_email || card.display_address) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 w-full flex flex-col items-center gap-3"
            >
              {card.card_email && (
                <a
                  href={`mailto:${card.card_email}`}
                  className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>{card.card_email}</span>
                </a>
              )}

              {card.display_address && (
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="h-5 w-5" />
                  <span>{card.display_address}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Social Media Icons */}
          {socialMedia.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {socialMedia.map((social: SocialMedia, index: number) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ color: themeColor1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getSocialIcon(social.platform)}
                </motion.a>
              ))}
            </motion.div>
          ) : (
            // Default social media icons if none exist (for desktop view)
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              <motion.a
                href="#"
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ color: themeColor1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                href="#"
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ color: themeColor1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                href="#"
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ color: themeColor1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a
                href="#"
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ color: themeColor1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe size={20} />
              </motion.a>
              <motion.a
                href="#"
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ color: themeColor1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe size={20} />
              </motion.a>
              <motion.a
                href="#"
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ color: themeColor1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe size={20} />
              </motion.a>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full space-y-3 mb-8"
          >
            {defaultActionButtons.map((button: ActionButton, index: number) => (
              <motion.a
                key={index}
                href={button.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 bg-white/90 border border-white/10"
                style={{ color: themeColor1 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {getActionButtonIcon(button.label)}
                {button.label}
              </motion.a>
            ))}
          </motion.div>

          {/* Gallery button if photos exist */}
          {extraPhotos.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => setShowGalleryOverlay(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 mb-8 shadow-md text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Images size={18} />
              <span>View Gallery ({extraPhotos.length})</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-20 mt-auto">
        <div className="w-full py-4 bg-white/10 backdrop-blur-md">
          <div className="container mx-auto px-4 flex flex-col items-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <button
                onClick={() => (card.latitude && card.longitude ? setShowMapOverlay(true) : null)}
                className={`flex items-center gap-1 text-white hover:text-white/80 transition-colors text-sm ${!card.latitude && !card.longitude ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <MapIcon size={16} />
                <span>Location</span>
              </button>

              <button
                onClick={() => (card.card_wifi_ssid ? setShowWifiOverlay(true) : null)}
                className={`flex items-center gap-1 text-white hover:text-white/80 transition-colors text-sm ${!card.card_wifi_ssid ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Wifi size={16} />
                <span>WiFi</span>
              </button>

              <button
                onClick={() => setShowLeadFormOverlay(true)}
                className="flex items-center gap-1 text-white hover:text-white/80 transition-colors text-sm"
              >
                <Save size={16} />
                <span>Save Contact</span>
              </button>

              <button
                onClick={handleDownloadVCard}
                className="flex items-center gap-1 text-white hover:text-white/80 transition-colors text-sm"
              >
                <CreditCard size={16} />
                <span>vCard</span>
              </button>
            </div>

            <div className="text-white/60 text-xs">Powered by Identifini</div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons - Vertical on bottom right */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-40">
        {callAction && (
          <motion.a
            href={getFloatingActionUrl(callAction)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            style={{ color: themeColor1 }}
          >
            <Phone size={20} />
          </motion.a>
        )}

        {smsAction && (
          <motion.a
            href={getFloatingActionUrl(smsAction)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            style={{ color: themeColor1 }}
          >
            <MessageSquare size={20} />
          </motion.a>
        )}

        {emailAction && (
          <motion.a
            href={getFloatingActionUrl(emailAction)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            style={{ color: themeColor1 }}
          >
            <Mail size={20} />
          </motion.a>
        )}
      </div>

      {/* Overlays */}
      <QRCodeOverlay
        isOpen={showQROverlay}
        onClose={() => setShowQROverlay(false)}
        url={window.location.href}
        foregroundColor={themeColor1}
      />

      <WifiOverlay
        isOpen={showWifiOverlay}
        onClose={() => setShowWifiOverlay(false)}
        wifiSSID={card.card_wifi_ssid || ""}
        wifiPassword={card.card_wifi_password || ""}
        showToast={showToast}
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

      {/* Add CSS for animated gradient */}
      <style>{`
        .animated-gradient {
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}

export default CardView

