"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import CardService from "../../services/CardService"
import type { Card } from "../../types/card"
import { AnimatePresence, motion } from "framer-motion"
import {
  Phone,
  Mail,
  MapPin,
  Download,
  QrCode,
  X,
  User,
  Globe,
  Calendar,
  Home,
  Heart,
  Camera,
  Plane,
  Utensils,
  BookOpen,
  Music,
  Film,
  Share2,
  Copy,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"

// Define tab types
type TabType = "profile" | "resume" | "gallery"

const CardView: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showQROverlay, setShowQROverlay] = useState<boolean>(false)
  const [showShareOverlay, setShowShareOverlay] = useState<boolean>(false)
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 768)
  const cardRef = useRef<HTMLDivElement>(null)
  const [showFloatingButtons, setShowFloatingButtons] = useState<boolean>(true)
  const [lastScrollY, setLastScrollY] = useState<number>(0)
  const [isScrollingDown, setIsScrollingDown] = useState<boolean>(false)
  const userToggledRef = useRef<boolean>(false)
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch card data
  useEffect(() => {
    const fetchCard = async () => {
      try {
        if (!username) {
          setError("Username is required")
          setLoading(false)
          return
        }

        const cardData = await CardService.getCardByUsername(username)
        setCard(cardData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching card:", err)
        setError("Failed to load card data")
        setLoading(false)
      }
    }

    fetchCard()
  }, [username])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Handle scroll for hiding floating buttons
  useEffect(() => {
    let scrollTimer: NodeJS.Timeout | null = null
    let lastScrollPosition = window.scrollY
    let isScrolling = false

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      isScrolling = true

      // Check if scrolling down by comparing with last position
      if (currentScrollY > lastScrollPosition + 5) {
        if (!userToggledRef.current) {
          setShowFloatingButtons(false)
        }
      }

      // Update last scroll position
      lastScrollPosition = currentScrollY

      // Clear any existing timer
      if (scrollTimer) clearTimeout(scrollTimer)

      // Set a timer to show buttons when scrolling stops
      scrollTimer = setTimeout(() => {
        isScrolling = false
        if (!userToggledRef.current) {
          setShowFloatingButtons(true)
        }
      }, 1000) // Show buttons 1 second after scrolling stops
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Clean up event listener and timer
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimer) clearTimeout(scrollTimer)
    }
  }, [])

  // Check if current user is the owner of the card
  const isOwner = () => {
    if (!user || !card) return false
    return user._id === card.user
  }

  // Handle share button click
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${card?.display_name}'s Digital Card`,
          text: `Check out ${card?.display_name}'s digital business card`,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error))
    } else {
      setShowShareOverlay(true)
    }
  }

  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setToastMessage("Link copied to clipboard")

    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Handle download vCard
  const handleDownloadVCard = () => {
    if (!card) return

    const vCardData = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${card.display_name}`,
      `NOTE:${card.bio || ""}`,
      `EMAIL:${card.card_email || ""}`,
      `ADR:;;${card.display_address || ""}`,
      "END:VCARD",
    ].join("\n")

    const blob = new Blob([vCardData], { type: "text/vcard" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${card.display_name.replace(/\s+/g, "_")}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setToastMessage("Contact saved to your device")

    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Get job title from individual details if available
  const getJobTitle = () => {
    if (card?.individual_details?.job_title) {
      return card.individual_details.job_title
    }
    return ""
  }

  // Render QR code overlay
  const renderQROverlay = () => {
    if (!showQROverlay) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">QR Code</h3>
            <button onClick={() => setShowQROverlay(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="flex justify-center mb-4">
            <QRCodeCanvas value={window.location.href} size={200} />
          </div>
          <p className="text-center text-sm text-gray-600 mb-4">Scan this QR code to view this digital card</p>
          <button
            onClick={() => {
              const canvas = document.querySelector("canvas")
              if (canvas) {
                const link = document.createElement("a")
                link.href = canvas.toDataURL("image/png")
                link.download = `${card?.display_name.replace(/\s+/g, "_")}_qr.png`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                setToastMessage("QR Code saved to your device")
                setTimeout(() => {
                  setToastMessage(null)
                }, 3000)
              }
            }}
            className="w-full py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
          >
            Download QR Code
          </button>
        </div>
      </div>
    )
  }

  // Render share overlay
  const renderShareOverlay = () => {
    if (!showShareOverlay) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Share Card</h3>
            <button onClick={() => setShowShareOverlay(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => {
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                  "_blank",
                )
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                </svg>
              </div>
              <span className="text-xs">Facebook</span>
            </button>
            <button
              onClick={() => {
                window.open(
                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out ${card?.display_name}'s digital business card`)}`,
                  "_blank",
                )
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </div>
              <span className="text-xs">Twitter</span>
            </button>
            <button
              onClick={() => {
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(`Check out ${card?.display_name}'s digital business card: ${window.location.href}`)}`,
                  "_blank",
                )
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <span className="text-xs">WhatsApp</span>
            </button>
            <button
              onClick={() => {
                window.open(
                  `mailto:?subject=${encodeURIComponent(`${card?.display_name}'s Digital Card`)}&body=${encodeURIComponent(`Check out ${card?.display_name}'s digital business card: ${window.location.href}`)}`,
                  "_blank",
                )
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white">
                <Mail size={20} />
              </div>
              <span className="text-xs">Email</span>
            </button>
            <button onClick={handleCopyLink} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white">
                <Copy size={20} />
              </div>
              <span className="text-xs">Copy Link</span>
            </button>
            <button
              onClick={() => {
                setShowShareOverlay(false)
                setShowQROverlay(true)
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white">
                <QrCode size={20} />
              </div>
              <span className="text-xs">QR Code</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render social media icons
  const renderSocialIcons = () => {
    if (!card || !card.social_medias || card.social_medias.length === 0) {
      // Default social icons if none provided
      return (
        <div className="flex justify-center gap-3 my-4">
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Globe size={18} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </button>
        </div>
      )
    }

    const socialMedias = typeof card.social_medias === "string" ? JSON.parse(card.social_medias) : card.social_medias

    return (
      <div className="flex justify-center gap-3 my-4">
        {socialMedias.map((social: any, index: number) => {
          // Determine icon based on platform
          let icon
          const platform = social.platform?.toLowerCase() || ""

          if (platform.includes("facebook")) {
            icon = (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
              </svg>
            )
          } else if (platform.includes("twitter")) {
            icon = (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            )
          } else if (platform.includes("linkedin")) {
            icon = (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            )
          } else if (platform.includes("instagram")) {
            icon = (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            )
          } else {
            icon = <Globe size={18} />
          }

          return (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              {icon}
            </a>
          )
        })}
      </div>
    )
  }

  // Render action buttons
  const renderActionButtons = () => {
    if (!card || !card.action_buttons || card.action_buttons.length === 0) {
      // Default action buttons if none provided
      return (
        <div className="space-y-3 mb-6 w-full">
          <a
            href="#"
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Globe size={18} />
            <span>My Website</span>
          </a>
          <a
            href="#"
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Calendar size={18} />
            <span>Book a Meeting</span>
          </a>
        </div>
      )
    }

    const actionButtons =
      typeof card.action_buttons === "string" ? JSON.parse(card.action_buttons) : card.action_buttons

    return (
      <div className="space-y-3 mb-6 w-full">
        {actionButtons.map((button: any, index: number) => {
          // Determine icon based on label
          let icon
          const label = button.label?.toLowerCase() || ""

          if (label.includes("website")) {
            icon = <Globe size={18} />
          } else if (label.includes("store")) {
            icon = (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            )
          } else if (label.includes("meeting") || label.includes("book")) {
            icon = <Calendar size={18} />
          } else if (label.includes("coffee")) {
            icon = (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
            )
          } else {
            icon = <Globe size={18} />
          }

          return (
            <a
              key={index}
              href={button.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              {icon}
              <span>{button.label}</span>
            </a>
          )
        })}
      </div>
    )
  }

  // Render interests
  const renderInterests = () => {
    if (!card?.individual_details?.interests || card.individual_details.interests.length === 0) {
      return null
    }

    return (
      <div className="grid grid-cols-3 gap-4">
        {card.individual_details.interests.map((interest, index) => {
          // Map interests to icons
          let icon
          const interestLower = interest.toLowerCase()

          if (interestLower.includes("photo")) {
            icon = <Camera size={24} />
          } else if (interestLower.includes("travel")) {
            icon = <Plane size={24} />
          } else if (interestLower.includes("cook")) {
            icon = <Utensils size={24} />
          } else if (interestLower.includes("read")) {
            icon = <BookOpen size={24} />
          } else if (interestLower.includes("music")) {
            icon = <Music size={24} />
          } else if (interestLower.includes("movie") || interestLower.includes("film")) {
            icon = <Film size={24} />
          } else {
            icon = <Camera size={24} />
          }

          return (
            <div key={index} className="bg-blue-50 p-4 rounded-lg flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2 text-blue-500">
                {icon}
              </div>
              <span className="text-gray-700 font-medium text-center">{interest}</span>
            </div>
          )
        })}
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Desktop view
  if (isDesktop) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full translate-x-1/3"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full -translate-y-1/4"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full"></div>
        </div>
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md z-50"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Container */}
        <div
          ref={cardRef}
          className="flex w-full max-w-7xl bg-white rounded-lg shadow-xl border border-gray-200/50 overflow-hidden z-10 relative"
        >
          {/* Left Column - Profile Info */}
          <div className="w-1/3 bg-white border-r border-gray-200">
            {/* Card Header with Background Image */}
            <div
              className="h-48 relative bg-cover bg-center"
              style={{
                background:
                  card?.theme_color_1 && card?.theme_color_2
                    ? `linear-gradient(to right, ${card.theme_color_1}, ${card.theme_color_2})`
                    : "linear-gradient(to right, #4f46e5, #06b6d4)",
              }}
            >
              {/* Profile Picture */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center">
                  {card?.card_pic ? (
                    <img
                      src={card.card_pic || "/placeholder.svg"}
                      alt={card.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-20 px-6 text-center w-full">
              <h1 className="text-2xl font-bold">{card?.display_name || ""}</h1>
              <p className="text-gray-600 text-sm mt-1">{getJobTitle()}</p>

              <p className="text-gray-600 text-sm mt-4 mb-6">{card?.bio || ""}</p>

              {/* Social Media Icons */}
              {renderSocialIcons()}

              {/* Call and Email Buttons */}
              <div className="flex gap-4 mb-6 w-full">
                <a
                  href={`tel:${card?.phone || ""}`}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-full flex items-center justify-center font-medium hover:bg-blue-600 transition-colors"
                >
                  <Phone size={18} className="mr-2" />
                  Call
                </a>
                <a
                  href={`mailto:${card?.card_email || ""}`}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-full flex items-center justify-center font-medium hover:bg-blue-600 transition-colors"
                >
                  <Mail size={18} className="mr-2" />
                  Email
                </a>
              </div>

              {/* Action Buttons */}
              {renderActionButtons()}

              {/* Save Contact Button */}
              <button
                onClick={handleDownloadVCard}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-full flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors mb-6"
              >
                <Download size={18} />
                <span>Save Contact</span>
              </button>
            </div>
          </div>

          {/* Right Column - Tab Content */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="p-4 bg-gray-50">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md ${
                    activeTab === "profile" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("resume")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md ${
                    activeTab === "resume" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Resume
                </button>
                <button
                  onClick={() => setActiveTab("gallery")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md ${
                    activeTab === "gallery" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Gallery
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "profile" && (
                <div className="space-y-8">
                  {/* Contact Information */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                    <div className="space-y-4">
                      {card?.card_email && (
                        <div className="flex items-center">
                          <Mail className="text-blue-500 mr-3" size={20} />
                          <a href={`mailto:${card.card_email}`} className="text-gray-700 hover:text-blue-500">
                            {card.card_email}
                          </a>
                        </div>
                      )}
                      {card?.phone && (
                        <div className="flex items-center">
                          <Phone className="text-blue-500 mr-3" size={20} />
                          <a href={`tel:${card.phone}`} className="text-gray-700 hover:text-blue-500">
                            {card.phone}
                          </a>
                        </div>
                      )}
                      {card?.display_address && (
                        <div className="flex items-center">
                          <MapPin className="text-blue-500 mr-3" size={20} />
                          <span className="text-gray-700">{card.display_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* About */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">About</h2>
                    <p className="text-gray-700">{card?.bio || ""}</p>
                  </div>

                  {card?.individual_details && (
                    <>
                      <hr className="border-gray-200" />

                      {/* Personal Details */}
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
                        <div className="grid grid-cols-2 gap-6">
                          {card.individual_details.birthday && (
                            <div>
                              <h3 className="text-gray-500 mb-2">Birthday</h3>
                              <div className="flex items-center">
                                <Calendar className="text-blue-500 mr-2" size={18} />
                                <span className="text-gray-700">{card.individual_details.birthday}</span>
                              </div>
                            </div>
                          )}
                          {card.individual_details.hometown && (
                            <div>
                              <h3 className="text-gray-500 mb-2">Hometown</h3>
                              <div className="flex items-center">
                                <Home className="text-blue-500 mr-2" size={18} />
                                <span className="text-gray-700">{card.individual_details.hometown}</span>
                              </div>
                            </div>
                          )}
                          {card.individual_details.current_city && (
                            <div>
                              <h3 className="text-gray-500 mb-2">Current City</h3>
                              <div className="flex items-center">
                                <MapPin className="text-blue-500 mr-2" size={18} />
                                <span className="text-gray-700">{card.individual_details.current_city}</span>
                              </div>
                            </div>
                          )}
                          {card.individual_details.relationship_status && (
                            <div>
                              <h3 className="text-gray-500 mb-2">Relationship</h3>
                              <div className="flex items-center">
                                <Heart className="text-blue-500 mr-2" size={18} />
                                <span className="text-gray-700">{card.individual_details.relationship_status}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {card.individual_details.interests && card.individual_details.interests.length > 0 && (
                        <>
                          <hr className="border-gray-200" />

                          {/* Interests & Hobbies */}
                          <div>
                            <h2 className="text-xl font-semibold mb-4">Interests & Hobbies</h2>
                            {renderInterests()}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "resume" && (
                <div className="space-y-6">
                  {card?.individual_details?.resume ? (
                    <div className="space-y-6">
                      {card.individual_details.resume.education && (
                        <div>
                          <h2 className="text-xl font-semibold mb-4">Education</h2>
                          <p className="text-gray-700">{card.individual_details.resume.education}</p>
                        </div>
                      )}

                      {card.individual_details.resume.experience && (
                        <div>
                          <h2 className="text-xl font-semibold mb-4">Experience</h2>
                          <p className="text-gray-700">{card.individual_details.resume.experience}</p>
                        </div>
                      )}

                      {card.individual_details.resume.skills && card.individual_details.resume.skills.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold mb-4">Skills</h2>
                          <div className="flex flex-wrap gap-2">
                            {card.individual_details.resume.skills.map((skill, index) => (
                              <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {card.individual_details.resume.certifications &&
                        card.individual_details.resume.certifications.length > 0 && (
                          <div>
                            <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                            <ul className="list-disc pl-5 space-y-2">
                              {card.individual_details.resume.certifications.map((cert, index) => (
                                <li key={index} className="text-gray-700">
                                  {cert}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Resume content will be displayed here</p>
                  )}
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="space-y-6">
                  {card?.extra_photos && card.extra_photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {(typeof card.extra_photos === "string" ? JSON.parse(card.extra_photos) : card.extra_photos).map(
                        (photo: string, index: number) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden">
                            <img
                              src={photo || "/placeholder.svg"}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No gallery images available</p>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Footer */}
          <div className="w-full py-3 text-center text-gray-500 text-xs border-t border-gray-200 mt-auto">
            © {new Date().getFullYear()} Identifini. All rights reserved.
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {showFloatingButtons && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col gap-8 mb-8" // Increased gap and added margin bottom
              >
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={handleShare}
                  className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                >
                  <Share2 size={20} />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setShowQROverlay(true)}
                  className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                >
                  <QrCode size={20} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => {
              userToggledRef.current = true
              setShowFloatingButtons(!showFloatingButtons)
              // Reset after a delay so auto-show can work again later
              setTimeout(() => {
                userToggledRef.current = false
              }, 5000)
            }}
            className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            {showFloatingButtons ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </motion.button>
        </div>

        {/* Render QR and Share Overlays */}
        {renderQROverlay()}
        {renderShareOverlay()}
      </div>
    )
  }

  // Mobile view
  return (
    <div className="min-h-screen bg-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md z-50"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Container */}
      <div ref={cardRef} className="flex flex-col">
        {/* Card Header with Background Image */}
        <div
          className="h-48 relative bg-cover bg-center"
          style={{
            background:
              card?.theme_color_1 && card?.theme_color_2
                ? `linear-gradient(to right, ${card.theme_color_1}, ${card.theme_color_2})`
                : "linear-gradient(to right, #4f46e5, #06b6d4)",
          }}
        >
          {/* Profile Picture */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center">
              {card?.card_pic ? (
                <img
                  src={card.card_pic || "/placeholder.svg"}
                  alt={card.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <User size={48} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-6 text-center">
          <h1 className="text-2xl font-bold">{card?.display_name || ""}</h1>
          <p className="text-gray-600 text-sm mt-1">{getJobTitle()}</p>

          <p className="text-gray-600 text-sm mt-4 mb-6">{card?.bio || ""}</p>

          {/* Social Media Icons */}
          {renderSocialIcons()}

          {/* Call and Email Buttons */}
          <div className="flex gap-4 mb-6">
            <a
              href={`tel:${card?.phone || ""}`}
              className="flex-1 bg-blue-500 text-white py-3 rounded-full flex items-center justify-center font-medium hover:bg-blue-600 transition-colors"
            >
              <Phone size={18} className="mr-2" />
              Call
            </a>
            <a
              href={`mailto:${card?.card_email || ""}`}
              className="flex-1 bg-blue-500 text-white py-3 rounded-full flex items-center justify-center font-medium hover:bg-blue-600 transition-colors"
            >
              <Mail size={18} className="mr-2" />
              Email
            </a>
          </div>

          {/* Action Buttons */}
          {renderActionButtons()}

          {/* Save Contact Button */}
          <button
            onClick={handleDownloadVCard}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-full flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors mb-6"
          >
            <Download size={18} />
            <span>Save Contact</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-gray-50 p-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                activeTab === "profile" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                activeTab === "resume" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Resume
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                activeTab === "gallery" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Gallery
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {card?.card_email && (
                    <div className="flex items-center">
                      <Mail className="text-blue-500 mr-3" size={20} />
                      <a href={`mailto:${card.card_email}`} className="text-gray-700 hover:text-blue-500">
                        {card.card_email}
                      </a>
                    </div>
                  )}
                  {card?.phone && (
                    <div className="flex items-center">
                      <Phone className="text-blue-500 mr-3" size={20} />
                      <a href={`tel:${card.phone}`} className="text-gray-700 hover:text-blue-500">
                        {card.phone}
                      </a>
                    </div>
                  )}
                  {card?.display_address && (
                    <div className="flex items-center">
                      <MapPin className="text-blue-500 mr-3" size={20} />
                      <span className="text-gray-700">{card.display_address}</span>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Personal Details */}
              {card?.individual_details && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
                    <div className="grid grid-cols-2 gap-6">
                      {card.individual_details.birthday && (
                        <div>
                          <h3 className="text-gray-500 mb-2">Birthday</h3>
                          <div className="flex items-center">
                            <Calendar className="text-blue-500 mr-2" size={18} />
                            <span className="text-gray-700">{card.individual_details.birthday}</span>
                          </div>
                        </div>
                      )}
                      {card.individual_details.hometown && (
                        <div>
                          <h3 className="text-gray-500 mb-2">Hometown</h3>
                          <div className="flex items-center">
                            <Home className="text-blue-500 mr-2" size={18} />
                            <span className="text-gray-700">{card.individual_details.hometown}</span>
                          </div>
                        </div>
                      )}
                      {card.individual_details.current_city && (
                        <div>
                          <h3 className="text-gray-500 mb-2">Current City</h3>
                          <div className="flex items-center">
                            <MapPin className="text-blue-500 mr-2" size={18} />
                            <span className="text-gray-700">{card.individual_details.current_city}</span>
                          </div>
                        </div>
                      )}
                      {card.individual_details.relationship_status && (
                        <div>
                          <h3 className="text-gray-500 mb-2">Relationship</h3>
                          <div className="flex items-center">
                            <Heart className="text-blue-500 mr-2" size={18} />
                            <span className="text-gray-700">{card.individual_details.relationship_status}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-200" />
                </>
              )}

              {/* Interests & Hobbies */}
              {card?.individual_details?.interests && card.individual_details.interests.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Interests & Hobbies</h2>
                  {renderInterests()}
                </div>
              )}
            </div>
          )}

          {activeTab === "resume" && (
            <div className="space-y-6">
              {card?.individual_details?.resume ? (
                <div className="space-y-6">
                  {card.individual_details.resume.education && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Education</h2>
                      <p className="text-gray-700">{card.individual_details.resume.education}</p>
                    </div>
                  )}

                  {card.individual_details.resume.experience && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Experience</h2>
                      <p className="text-gray-700">{card.individual_details.resume.experience}</p>
                    </div>
                  )}

                  {card.individual_details.resume.skills && card.individual_details.resume.skills.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {card.individual_details.resume.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {card.individual_details.resume.certifications &&
                    card.individual_details.resume.certifications.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                        <ul className="list-disc pl-5 space-y-2">
                          {card.individual_details.resume.certifications.map((cert, index) => (
                            <li key={index} className="text-gray-700">
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Resume content will be displayed here</p>
              )}
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-6">
              {card?.extra_photos && card.extra_photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {(typeof card.extra_photos === "string" ? JSON.parse(card.extra_photos) : card.extra_photos).map(
                    (photo: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No gallery images available</p>
              )}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="w-full py-3 text-center text-gray-500 text-xs border-t border-gray-200 mt-auto">
          © {new Date().getFullYear()} Identifini. All rights reserved.
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showFloatingButtons && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col gap-8 mb-8"
            >
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: 0.1 }}
                onClick={handleShare}
                className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
              >
                <Share2 size={20} />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setShowQROverlay(true)}
                className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
              >
                <QrCode size={20} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => {
            userToggledRef.current = true
            setShowFloatingButtons(!showFloatingButtons)
            // Reset after a delay so auto-show can work again later
            setTimeout(() => {
              userToggledRef.current = false
            }, 5000)
          }}
          className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          {showFloatingButtons ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </motion.button>
      </div>

      {/* Render QR and Share Overlays */}
      {renderQROverlay()}
      {renderShareOverlay()}
    </div>
  )
}

export default CardView

