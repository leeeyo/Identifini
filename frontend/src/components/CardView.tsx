"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import CardService from "../services/CardService"
import type { Card } from "../types/card"
import { AnimatePresence, motion } from "framer-motion"
import { Phone, Mail, MapPin, Download, QrCode, X, ArrowUp } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import html2canvas from "html2canvas"
import Icon from "./Icon"
import {
  User,
  Globe,
  Twitter,
  Linkedin,
  Instagram,
  CalendarIcon,
  Camera,
  Plane,
  Utensils,
  BookOpen,
  Music,
  Film,
  Home,
  Heart,
} from "lucide-react"

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
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showQROverlay, setShowQROverlay] = useState<boolean>(false)
  const [showShareOverlay, setShowShareOverlay] = useState<boolean>(false)
  const [showFAB, setShowFAB] = useState<boolean>(false)
  const [lastScrollY, setLastScrollY] = useState<number>(0)
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 768)
  const cardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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

  // Handle scroll for FAB visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = isDesktop ? contentRef.current : window
      if (!scrollContainer) return

      const currentScrollY = isDesktop ? contentRef.current?.scrollTop || 0 : window.scrollY

      if (currentScrollY < 10) {
        setShowFAB(false)
        return
      }

      if (currentScrollY > lastScrollY) {
        // Scrolling down
        setShowFAB(false)
      } else {
        // Scrolling up
        setShowFAB(true)
      }

      setLastScrollY(currentScrollY)
    }

    const scrollContainer = isDesktop ? contentRef.current : window
    scrollContainer?.addEventListener("scroll", handleScroll)

    return () => {
      scrollContainer?.removeEventListener("scroll", handleScroll)
    }
  }, [lastScrollY, isDesktop])

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
    setShowDropdown(false)

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
    setShowDropdown(false)

    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Handle download card as image
  const handleDownloadImage = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = imgData
      link.download = `${card?.display_name.replace(/\s+/g, "_")}_card.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setToastMessage("Card image saved to your device")
      setShowDropdown(false)

      setTimeout(() => {
        setToastMessage(null)
      }, 3000)
    } catch (err) {
      console.error("Error generating image:", err)
      setToastMessage("Failed to download image")

      setTimeout(() => {
        setToastMessage(null)
      }, 3000)
    }
  }

  // Render social media icons
  const renderSocialIcons = () => {
    if (!card || !card.social_medias) return null

    const socialMedias = typeof card.social_medias === "string" ? JSON.parse(card.social_medias) : card.social_medias

    return (
      <div className="flex justify-center gap-4 my-4">
        {socialMedias.map((social: any, index: number) => (
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Icon name={social.icon || "FaLink"} />
          </a>
        ))}
      </div>
    )
  }

  // Render action buttons
  const renderActionButtons = () => {
    if (!card || !card.action_buttons) return null

    const actionButtons =
      typeof card.action_buttons === "string" ? JSON.parse(card.action_buttons) : card.action_buttons

    return (
      <div className="space-y-2 mt-4">
        {actionButtons.map((button: any, index: number) => (
          <a
            key={index}
            href={button.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Icon name={button.icon || "FaLink"} />
            <span>{button.label}</span>
          </a>
        ))}
      </div>
    )
  }

  // Render floating action buttons
  const renderFloatingActions = () => {
    if (!card || !card.floating_actions) return null

    const floatingActions =
      typeof card.floating_actions === "string" ? JSON.parse(card.floating_actions) : card.floating_actions

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: showFAB ? 1 : 0, scale: showFAB ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-20 right-4 md:right-8 flex flex-col gap-3 z-50"
      >
        {floatingActions.map((action: any, index: number) => (
          <a
            key={index}
            href={action.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg hover:bg-cyan-600 transition-colors"
          >
            <Icon name={action.icon || "FaLink"} />
          </a>
        ))}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowUp size={20} />
        </button>
      </motion.div>
    )
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
                <Icon name="FaFacebook" />
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
                <Icon name="FaTwitter" />
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
                <Icon name="FaWhatsapp" />
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
                <Icon name="FaCopy" />
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

  // Get job title from individual details if available
  const getJobTitle = () => {
    if (card?.individual_details?.job_title) {
      return card.individual_details.job_title
    }
    return ""
  }

  // Render desktop view
  if (isDesktop) {
    return (
      <div className="h-screen w-screen bg-gray-100 flex items-center justify-center overflow-hidden p-0">
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
        <div ref={cardRef} className="w-screen h-screen bg-white shadow-lg overflow-hidden flex flex-col md:flex-row">
          {/* Left Column - Profile Info */}
          <div className="w-full md:w-1/4 max-w-md bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Card Header with Gradient */}
            <div
              className="h-48 relative"
              style={{
                background:
                  card?.theme_color_1 && card?.theme_color_2
                    ? `linear-gradient(to right, ${card.theme_color_1}, ${card.theme_color_2})`
                    : "linear-gradient(to right, #4f46e5, #06b6d4)",
                backgroundSize: "cover",
                backgroundPosition: "center",
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
            <div className="pt-20 px-4 flex-1 flex flex-col overflow-hidden">
              <h1 className="text-2xl font-bold text-center">{card?.display_name || ""}</h1>
              <p className="text-gray-600 text-sm text-center mt-1">{getJobTitle()}</p>

              <p className="text-gray-600 text-sm text-center mt-4 mb-6">{card?.bio || ""}</p>

              {/* Social Media Icons */}
              {renderSocialIcons() || (
                <div className="flex justify-center gap-4 mb-6">
                  {card?.social_medias && card.social_medias.length > 0 ? (
                    renderSocialIcons()
                  ) : (
                    <>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Globe size={18} />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Twitter size={18} />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Linkedin size={18} />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Instagram size={18} />
                      </a>
                    </>
                  )}
                </div>
              )}

              {/* Call and Email Buttons */}
              <div className="flex gap-2 mb-6">
                <a
                  href={`tel:${card?.phone || ""}`}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-md flex items-center justify-center font-medium hover:bg-blue-600 transition-colors"
                >
                  <Phone size={18} className="mr-2" />
                  Call
                </a>
                <a
                  href={`mailto:${card?.card_email || ""}`}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-md flex items-center justify-center font-medium hover:bg-blue-600 transition-colors"
                >
                  <Mail size={18} className="mr-2" />
                  Email
                </a>
              </div>

              {/* Action Buttons */}
              {renderActionButtons() || (
                <div className="space-y-2 mb-4">
                  {card?.action_buttons && card.action_buttons.length > 0 ? (
                    renderActionButtons()
                  ) : (
                    <>
                      <a
                        href="#"
                        className="w-full py-3 px-4 bg-gray-100 rounded-md flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                      >
                        <Globe size={18} />
                        <span>My Website</span>
                      </a>
                      <a
                        href="#"
                        className="w-full py-3 px-4 bg-gray-100 rounded-md flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                      >
                        <CalendarIcon size={18} />
                        <span>Book a Meeting</span>
                      </a>
                    </>
                  )}
                </div>
              )}

              {/* Save Contact Button */}
              <button
                onClick={handleDownloadVCard}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors mt-auto mb-6"
              >
                <Download size={18} />
                <span>Save Contact</span>
              </button>
            </div>
          </div>

          {/* Right Column - Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex p-4 bg-gray-50">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-3 text-sm font-medium rounded-md ${
                  activeTab === "profile" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("resume")}
                className={`flex-1 py-3 text-sm font-medium rounded-md ${
                  activeTab === "resume" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Resume
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                className={`flex-1 py-3 text-sm font-medium rounded-md ${
                  activeTab === "gallery" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Gallery
              </button>
            </div>

            {/* Tab Content */}
            <div ref={contentRef} className="flex-1 overflow-hidden p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {card.individual_details.birthday && (
                            <div>
                              <h3 className="text-gray-500 mb-2">Birthday</h3>
                              <div className="flex items-center">
                                <CalendarIcon className="text-blue-500 mr-2" size={18} />
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
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {card.individual_details.interests.map((interest, index) => {
                                // Map interests to icons (simplified example)
                                const getInterestIcon = (interest: string) => {
                                  const interestLower = interest.toLowerCase()
                                  if (interestLower.includes("photo")) return Camera
                                  if (interestLower.includes("travel")) return Plane
                                  if (interestLower.includes("cook")) return Utensils
                                  if (interestLower.includes("read")) return BookOpen
                                  if (interestLower.includes("music")) return Music
                                  if (interestLower.includes("movie") || interestLower.includes("film")) return Film
                                  return Camera // Default icon
                                }

                                const InterestIcon = getInterestIcon(interest)

                                return (
                                  <div key={index} className="bg-blue-50 p-3 rounded-lg flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                                      <InterestIcon className="text-blue-500" size={20} />
                                    </div>
                                    <span className="text-gray-700 font-medium text-sm">{interest}</span>
                                  </div>
                                )
                              })}
                            </div>
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
        </div>
      </div>
    )
  }

  // Render mobile view (original design)
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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
      <div ref={cardRef} className="flex-1 flex flex-col bg-white">
        {/* Card Header with Gradient */}
        <div
          className="h-48 relative"
          style={{
            background:
              card?.theme_color_1 && card?.theme_color_2
                ? `linear-gradient(to right, ${card.theme_color_1}, ${card.theme_color_2})`
                : "linear-gradient(to right, #4f46e5, #06b6d4)",
            backgroundSize: "cover",
            backgroundPosition: "center",
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
          {renderSocialIcons() || (
            <div className="flex justify-center gap-4 mb-6">
              {card?.social_medias && card.social_medias.length > 0 ? (
                renderSocialIcons()
              ) : (
                <>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Globe size={18} />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Twitter size={18} />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Linkedin size={18} />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Instagram size={18} />
                  </a>
                </>
              )}
            </div>
          )}

          {/* Call and Email Buttons */}
          <div className="flex gap-4 mb-6">
            <a
              href={`tel:${card?.phone || ""}`}
              className="flex-1 bg-blue-500 text-white py-3 rounded-md flex items-center justify-center font-medium hover:bg-blue-600 transition-colors"
            >
              <Phone size={18} className="mr-2" />
              Call
            </a>
            <a
              href={`mailto:${card?.card_email || ""}`}
              className="flex-1 bg-blue-500 text-white py-3 rounded-md flex items-center justify-center font-medium hover:bg-blue-600 transition-colors"
            >
              <Mail size={18} className="mr-2" />
              Email
            </a>
          </div>

          {/* Action Buttons */}
          {renderActionButtons() || (
            <div className="space-y-3 mb-6">
              {card?.action_buttons && card.action_buttons.length > 0 ? (
                renderActionButtons()
              ) : (
                <>
                  <a
                    href="#"
                    className="w-full py-3 px-4 bg-gray-100 rounded-md flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Globe size={18} />
                    <span>My Website</span>
                  </a>
                  <a
                    href="#"
                    className="w-full py-3 px-4 bg-gray-100 rounded-md flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <CalendarIcon size={18} />
                    <span>Book a Meeting</span>
                  </a>
                </>
              )}
            </div>
          )}

          {/* Save Contact Button */}
          <button
            onClick={handleDownloadVCard}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors mb-6"
          >
            <Download size={18} />
            <span>Save Contact</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-4 bg-gray-50 sticky top-0 z-10">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 text-sm font-medium rounded-md ${
              activeTab === "profile" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className={`flex-1 py-3 text-sm font-medium rounded-md ${
              activeTab === "resume" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Resume
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex-1 py-3 text-sm font-medium rounded-md ${
              activeTab === "gallery" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Gallery
          </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {card.individual_details.birthday && (
                        <div>
                          <h3 className="text-gray-500 mb-2">Birthday</h3>
                          <div className="flex items-center">
                            <CalendarIcon className="text-blue-500 mr-2" size={18} />
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {card.individual_details.interests.map((interest, index) => {
                            // Map interests to icons (simplified example)
                            const getInterestIcon = (interest: string) => {
                              const interestLower = interest.toLowerCase()
                              if (interestLower.includes("photo")) return Camera
                              if (interestLower.includes("travel")) return Plane
                              if (interestLower.includes("cook")) return Utensils
                              if (interestLower.includes("read")) return BookOpen
                              if (interestLower.includes("music")) return Music
                              if (interestLower.includes("movie") || interestLower.includes("film")) return Film
                              return Camera // Default icon
                            }

                            const InterestIcon = getInterestIcon(interest)

                            return (
                              <div key={index} className="bg-blue-50 p-4 rounded-lg flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                                  <InterestIcon className="text-blue-500" size={24} />
                                </div>
                                <span className="text-gray-700 font-medium">{interest}</span>
                              </div>
                            )
                          })}
                        </div>
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

      {/* Render QR and Share Overlays */}
      {renderQROverlay()}
      {renderShareOverlay()}

      {/* Render Floating Actions */}
      {renderFloatingActions()}
    </div>
  )
}

export default CardView

