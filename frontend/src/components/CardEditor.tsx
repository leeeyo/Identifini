"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import CardPreview from "./CardPreview"
import CardService from "../services/CardService"
import ImageCropper from "./ImageCropper"
import { motion, AnimatePresence } from "framer-motion"
import type { Card } from "../types/card"

// Define tab names for the UI
enum Tab {
  Basic = "Basic",
  Appearance = "Appearance",
  Social = "Social",
  Actions = "Actions",
  Features = "Features",
  Menus = "Menus",
  Review = "Review",
}

// Interfaces
interface SocialMedia {
  platform: string
  url: string
  icon?: string
}

interface ActionButton {
  label: string
  url: string
  icon?: string
}

interface FloatingAction {
  type: string
  url: string
  icon?: string
}

export interface CardFormData {
  id?: string
  _id?: string
  card_username: string
  display_name: string
  bio?: string
  card_email?: string
  business_type?: string
  card_pic?: string
  display_address?: string
  theme_color_1?: string
  theme_color_2?: string
  theme_color_3?: string
  social_medias: SocialMedia[]
  action_buttons: ActionButton[]
  floating_actions: FloatingAction[]
  extra_photos: string[]
  card_wifi_ssid?: string
  card_wifi_password?: string
  latitude?: string
  longitude?: string
  custom_map_link?: string
  is_wifi_allowed: boolean
  created_at?: string
}

const initialFormData: CardFormData = {
  card_username: "",
  display_name: "",
  bio: "",
  card_email: "",
  business_type: "",
  card_pic: "",
  display_address: "",
  theme_color_1: "#4a90e2",
  theme_color_2: "#ffffff",
  theme_color_3: "#333333",
  social_medias: [],
  action_buttons: [],
  floating_actions: [],
  extra_photos: [],
  is_wifi_allowed: false,
}

// Color templates for easy selection
const colorTemplates = [
  { name: "Ocean Blue", primary: "#4a90e2", secondary: "#ffffff", text: "#333333" },
  { name: "Forest Green", primary: "#2ecc71", secondary: "#ffffff", text: "#333333" },
  { name: "Sunset Orange", primary: "#e67e22", secondary: "#ffffff", text: "#333333" },
  { name: "Royal Purple", primary: "#9b59b6", secondary: "#ffffff", text: "#333333" },
  { name: "Ruby Red", primary: "#e74c3c", secondary: "#ffffff", text: "#333333" },
  { name: "Midnight", primary: "#2c3e50", secondary: "#ffffff", text: "#ecf0f1" },
  { name: "Turquoise", primary: "#1abc9c", secondary: "#ffffff", text: "#333333" },
  { name: "Dark Mode", primary: "#121212", secondary: "#1e1e1e", text: "#ffffff" },
]

// Social media platforms with icons
const socialPlatforms = [
  { name: "Instagram", icon: "instagram" },
  { name: "Facebook", icon: "facebook" },
  { name: "Twitter", icon: "twitter" },
  { name: "LinkedIn", icon: "linkedin" },
  { name: "YouTube", icon: "youtube" },
  { name: "TikTok", icon: "music" },
  { name: "Pinterest", icon: "image" },
  { name: "Snapchat", icon: "camera" },
  { name: "GitHub", icon: "github" },
  { name: "Dribbble", icon: "dribbble" },
  { name: "Behance", icon: "figma" },
  { name: "Medium", icon: "book-open" },
  { name: "Website", icon: "globe" },
]

const CardEditor: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()

  // Active tab state
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Basic)
  const [formData, setFormData] = useState<CardFormData>(initialFormData)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Image Cropper State
  const [showCropper, setShowCropper] = useState(false)
  const [selectedFileType, setSelectedFileType] = useState<"profile" | "gallery" | null>(null)
  const [tempImageUrl, setTempImageUrl] = useState<string>("")

  // For slide transitions between tabs
  const [direction, setDirection] = useState<"forward" | "backward">("forward")

  // Fetch card data
  useEffect(() => {
    const fetchCardData = async () => {
      if (!username) return

      try {
        setInitialLoading(true)
        const card = await CardService.getCardByUsername(username)

        // Parse JSON strings if they exist
        const parsedCard = {
          ...card,
          social_medias:
            typeof card.social_medias === "string" ? JSON.parse(card.social_medias) : card.social_medias || [],
          action_buttons:
            typeof card.action_buttons === "string" ? JSON.parse(card.action_buttons) : card.action_buttons || [],
          floating_actions:
            typeof card.floating_actions === "string" ? JSON.parse(card.floating_actions) : card.floating_actions || [],
          extra_photos: typeof card.extra_photos === "string" ? JSON.parse(card.extra_photos) : card.extra_photos || [],
          is_wifi_allowed: !!card.card_wifi_ssid,
        }

        setFormData(parsedCard)
        setInitialLoading(false)
      } catch (err) {
        console.error("Error fetching card data:", err)
        setMessage({ type: "error", text: "Failed to load card data. Please try again later." })
        setInitialLoading(false)
      }
    }

    fetchCardData()
  }, [username])

  // Email validation
  const validateEmail = (email: string) => {
    if (!email || email.trim() === "") {
      setEmailError(null)
      return true
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    } else {
      setEmailError(null)
      return true
    }
  }

  // Validate email when it changes
  useEffect(() => {
    if (formData.card_email) {
      validateEmail(formData.card_email)
    }
  }, [formData.card_email])

  const handleTabChange = (tab: Tab, direction: "forward" | "backward" = "forward") => {
    // Validate current tab before changing
    if (activeTab === Tab.Basic && tab !== Tab.Basic) {
      if (!formData.display_name.trim()) {
        setMessage({ type: "error", text: "Display Name is required." })
        return
      }
    }

    if (activeTab === Tab.Appearance && tab !== Tab.Appearance) {
      // Any validation for appearance tab
    }

    if (activeTab === Tab.Social && tab !== Tab.Social) {
      // Validate social media URLs if any
      const invalidSocial = formData.social_medias.find((sm) => sm.url && !sm.url.trim().startsWith("http"))
      if (invalidSocial) {
        setMessage({ type: "error", text: `URL for ${invalidSocial.platform} must start with http:// or https://` })
        return
      }
    }

    // Direction for animation
    setDirection(direction)

    // Change tab with animation
    setActiveTab(tab)
    setMessage(null)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)

    // Basic validation
    if (!formData.card_username.trim() || !formData.display_name.trim()) {
      setMessage({ type: "error", text: "Username and Display Name are required." })
      setLoading(false)
      return
    }

    // Validate email if provided
    if (formData.card_email && !validateEmail(formData.card_email)) {
      setMessage({ type: "error", text: emailError || "Please enter a valid email address" })
      setLoading(false)
      return
    }

    try {
      const cardId = formData._id || formData.id
      if (!cardId) {
        throw new Error("Card ID is missing")
      }

      // Prepare data for submission
      const cardData = { ...formData }

      await CardService.updateCard(cardId, cardData)
      setMessage({ type: "success", text: "Card updated successfully!" })
      setTimeout(() => navigate("/"), 2000)
    } catch (err: any) {
      console.error(err)
      setMessage({
        type: "error",
        text: err.response?.data?.error || err.message || "Update failed.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Form Field Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  // Handle color template selection
  const handleSelectColorTemplate = (template: (typeof colorTemplates)[0]) => {
    setFormData({
      ...formData,
      theme_color_1: template.primary,
      theme_color_2: template.secondary,
      theme_color_3: template.text,
    })
  }

  // Image handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "gallery") => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFileType(type)
    const reader = new FileReader()
    reader.onloadend = () => {
      setTempImageUrl(reader.result as string)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = (croppedImageUrl: string) => {
    if (selectedFileType === "profile") {
      setFormData((prev) => ({ ...prev, card_pic: croppedImageUrl }))
    } else if (selectedFileType === "gallery") {
      setFormData((prev) => ({ ...prev, extra_photos: [...prev.extra_photos, croppedImageUrl] }))
    }
  }

  // Dynamic Fields (only a few examples are shown)
  const addSocialMedia = () => {
    setFormData((prev) => ({
      ...prev,
      social_medias: [...prev.social_medias, { platform: "", url: "", icon: "fa fa-globe" }],
    }))
  }

  const updateSocialMedia = (index: number, field: string, value: string) => {
    const updated = [...formData.social_medias]
    updated[index] = { ...updated[index], [field]: value }
    setFormData((prev) => ({ ...prev, social_medias: updated }))
  }

  const removeSocialMedia = (index: number) => {
    const updated = [...formData.social_medias]
    updated.splice(index, 1)
    setFormData((prev) => ({ ...prev, social_medias: updated }))
  }

  const addActionButton = () => {
    setFormData((prev) => ({
      ...prev,
      action_buttons: [...prev.action_buttons, { label: "", url: "", icon: "fa fa-link" }],
    }))
  }

  const updateActionButton = (index: number, field: string, value: string) => {
    const updated = [...formData.action_buttons]
    updated[index] = { ...updated[index], [field]: value }
    setFormData((prev) => ({ ...prev, action_buttons: updated }))
  }

  const removeActionButton = (index: number) => {
    const updated = [...formData.action_buttons]
    updated.splice(index, 1)
    setFormData((prev) => ({ ...prev, action_buttons: updated }))
  }

  const addFloatingAction = () => {
    setFormData((prev) => ({
      ...prev,
      floating_actions: [...prev.floating_actions, { type: "", url: "", icon: "fa fa-link" }],
    }))
  }

  const updateFloatingAction = (index: number, field: string, value: string) => {
    const updated = [...formData.floating_actions]
    updated[index] = { ...updated[index], [field]: value }
    setFormData((prev) => ({ ...prev, floating_actions: updated }))
  }

  const removeFloatingAction = (index: number) => {
    const updated = [...formData.floating_actions]
    updated.splice(index, 1)
    setFormData((prev) => ({ ...prev, floating_actions: updated }))
  }

  // Animation variants for page transitions
  const pageVariants = {
    initial: (direction: "forward" | "backward") => ({
      opacity: 0,
      x: direction === "forward" ? 100 : -100,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: "forward" | "backward") => ({
      opacity: 0,
      x: direction === "forward" ? -100 : 100,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  }

  if (initialLoading) {
    return (
      <div className="bg-background-dark min-h-screen pt-20 pb-12 px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-card-foreground">Loading card data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background-dark min-h-screen pt-20 pb-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-card-foreground">Edit Card: {formData.card_username}</h1>
          <Link to="/" className="flex items-center text-primary hover:text-primary/90 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-border">
          <div className="flex flex-wrap -mb-px">
            {Object.values(Tab).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab, activeTab > tab ? "backward" : "forward")}
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-card-foreground hover:border-border"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Static Go to Review Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => handleTabChange(Tab.Review)}
            className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors duration-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Go to Review
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "error"
                ? "bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-800 text-red-700 dark:text-red-400"
                : "bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-800 text-green-700 dark:text-green-400"
            } animate-fadeIn`}
          >
            <p>{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-md border border-border p-6 transition-colors duration-300 min-h-[500px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeTab}
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-full"
                >
                  {/* Basic Information Tab */}
                  {activeTab === Tab.Basic && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Basic Information</h2>

                      <div>
                        <label htmlFor="card_username" className="block text-sm font-medium text-card-foreground mb-1">
                          Username (URL)
                        </label>
                        <input
                          type="text"
                          id="card_username"
                          name="card_username"
                          value={formData.card_username}
                          readOnly
                          className="w-full px-4 py-3 rounded-lg border border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">Username cannot be changed after creation</p>
                      </div>

                      <div>
                        <label htmlFor="display_name" className="block text-sm font-medium text-card-foreground mb-1">
                          Display Name*
                        </label>
                        <input
                          type="text"
                          id="display_name"
                          name="display_name"
                          value={formData.display_name}
                          onChange={handleChange}
                          required
                          placeholder="e.g. John Doe or Business Name"
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-card-foreground mb-1">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio || ""}
                          onChange={handleChange}
                          placeholder="Tell us about yourself or your business"
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="card_email" className="block text-sm font-medium text-card-foreground mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            id="card_email"
                            name="card_email"
                            value={formData.card_email || ""}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className={`w-full px-4 py-3 rounded-lg border ${
                              emailError ? "border-red-500 dark:border-red-400" : "border-border"
                            } bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                              emailError ? "focus:ring-red-500" : "focus:ring-primary"
                            } focus:border-transparent pr-10 transition-all duration-200`}
                            onBlur={() => validateEmail(formData.card_email || "")}
                          />
                          {formData.card_email && !emailError && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        {emailError && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{emailError}</p>}
                      </div>

                      <div>
                        <label
                          htmlFor="display_address"
                          className="block text-sm font-medium text-card-foreground mb-1"
                        >
                          Address
                        </label>
                        <input
                          type="text"
                          id="display_address"
                          name="display_address"
                          value={formData.display_address || ""}
                          onChange={handleChange}
                          placeholder="123 Main St, City, Country"
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          Your physical address that will be displayed on your card
                        </p>
                      </div>

                      <div>
                        <label htmlFor="business_type" className="block text-sm font-medium text-card-foreground mb-1">
                          Business Type
                        </label>
                        <select
                          id="business_type"
                          name="business_type"
                          value={formData.business_type || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select...</option>
                          <option value="personal">Personal</option>
                          <option value="restaurant">Restaurant/Café</option>
                          <option value="retail">Retail Store</option>
                          <option value="service">Service Business</option>
                          <option value="hotel">Hotel/Accommodation</option>
                          <option value="professional">Professional</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="profile_pic" className="block text-sm font-medium text-card-foreground mb-1">
                          Profile Picture
                        </label>
                        <div className="flex items-center space-x-4">
                          {formData.card_pic ? (
                            <div className="relative group">
                              <img
                                src={formData.card_pic || "/placeholder.svg"}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-md transition-all duration-300 group-hover:shadow-lg"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                                <label
                                  htmlFor="profile_pic_input"
                                  className="cursor-pointer text-transparent group-hover:text-white font-medium"
                                >
                                  Change
                                </label>
                              </div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-primary/50"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              id="profile_pic_input"
                              accept="image/*"
                              onChange={(e) => handleFileSelect(e, "profile")}
                              className="hidden"
                            />
                            <label
                              htmlFor="profile_pic_input"
                              className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-card-foreground bg-background hover:bg-muted focus:outline-none cursor-pointer transition-colors duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-primary"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {formData.card_pic ? "Change Photo" : "Upload Photo"}
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                          Tips for Basic Information
                        </h3>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc pl-5">
                          <li>Your display name is what people will see at the top of your card</li>
                          <li>A good bio helps people understand what you do or what your business offers</li>
                          <li>Adding your address makes it easy for people to find your physical location</li>
                          <li>Choose a clear, professional profile picture for the best impression</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Appearance Tab */}
                  {activeTab === Tab.Appearance && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Appearance</h2>

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-3">Color Templates</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                          {colorTemplates.map((template, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSelectColorTemplate(template)}
                              className={`p-3 rounded-lg border ${
                                formData.theme_color_1 === template.primary
                                  ? "border-primary shadow-md"
                                  : "border-border hover:border-primary/50"
                              } focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md`}
                            >
                              <div className="flex flex-col items-center">
                                <div
                                  className="w-full h-12 rounded-md mb-2"
                                  style={{ backgroundColor: template.primary }}
                                ></div>
                                <span className="text-xs text-card-foreground">{template.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-3">Custom Colors</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="theme_color_1" className="block text-sm text-muted-foreground mb-1">
                              Primary Color
                            </label>
                            <div className="flex items-center">
                              <input
                                type="color"
                                id="theme_color_1"
                                name="theme_color_1"
                                value={formData.theme_color_1}
                                onChange={handleChange}
                                className="w-10 h-10 rounded border-0 p-0 mr-2 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={formData.theme_color_1}
                                onChange={handleChange}
                                name="theme_color_1"
                                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-card-foreground transition-all duration-200"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="theme_color_2" className="block text-sm text-muted-foreground mb-1">
                              Secondary Color
                            </label>
                            <div className="flex items-center">
                              <input
                                type="color"
                                id="theme_color_2"
                                name="theme_color_2"
                                value={formData.theme_color_2}
                                onChange={handleChange}
                                className="w-10 h-10 rounded border-0 p-0 mr-2 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={formData.theme_color_2}
                                onChange={handleChange}
                                name="theme_color_2"
                                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-card-foreground transition-all duration-200"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="theme_color_3" className="block text-sm text-muted-foreground mb-1">
                              Text Color
                            </label>
                            <div className="flex items-center">
                              <input
                                type="color"
                                id="theme_color_3"
                                name="theme_color_3"
                                value={formData.theme_color_3}
                                onChange={handleChange}
                                className="w-10 h-10 rounded border-0 p-0 mr-2 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={formData.theme_color_3}
                                onChange={handleChange}
                                name="theme_color_3"
                                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-card-foreground transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">Gallery Photos</label>
                        <div className="mb-4">
                          <input
                            type="file"
                            id="gallery_pic_input"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, "gallery")}
                            className="hidden"
                          />
                          <label
                            htmlFor="gallery_pic_input"
                            className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-card-foreground bg-background hover:bg-muted focus:outline-none cursor-pointer transition-colors duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-primary"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Add Gallery Photo
                          </label>
                        </div>

                        {formData.extra_photos.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {formData.extra_photos.map((photo, i) => (
                              <div key={i} className="relative group">
                                <img
                                  src={photo || "/placeholder.svg"}
                                  alt={`Gallery ${i + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-border shadow-sm transition-all duration-200 group-hover:shadow-md"
                                />
                                <button
                                  onClick={() => {
                                    const updated = [...formData.extra_photos]
                                    updated.splice(i, 1)
                                    setFormData((prev) => ({ ...prev, extra_photos: updated }))
                                  }}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                          Tips for Appearance
                        </h3>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc pl-5">
                          <li>Choose colors that match your brand or personal style</li>
                          <li>Make sure there's enough contrast between your text color and background</li>
                          <li>Gallery photos will appear in a slideshow on your card</li>
                          <li>For best results, use high-quality images with good lighting</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Social Media Tab */}
                  {activeTab === Tab.Social && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Social Media</h2>

                      {formData.social_medias.map((sm, i) => (
                        <div key={i} className="p-4 border border-border rounded-lg bg-background/50 relative group">
                          <button
                            onClick={() => removeSocialMedia(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            ×
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1">Platform</label>
                              <div className="relative">
                                <div className="flex items-center space-x-2 p-2 border border-border rounded-lg bg-background cursor-pointer hover:bg-muted/50 transition-colors">
                                  {sm.platform ? (
                                    <>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-primary"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        {sm.platform === "Instagram" && (
                                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                        )}
                                        {sm.platform === "Instagram" && (
                                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                        )}
                                        {sm.platform === "Instagram" && <path d="M17.5 6.5h.01"></path>}

                                        {sm.platform === "Facebook" && (
                                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                        )}

                                        {sm.platform === "Twitter" && (
                                          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                        )}

                                        {sm.platform === "LinkedIn" && (
                                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                        )}
                                        {sm.platform === "LinkedIn" && <rect x="2" y="9" width="4" height="12"></rect>}
                                        {sm.platform === "LinkedIn" && <circle cx="4" cy="4" r="2"></circle>}

                                        {sm.platform === "YouTube" && (
                                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                                        )}
                                        {sm.platform === "YouTube" && (
                                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                                        )}

                                        {sm.platform === "TikTok" && (
                                          <path d="M9 12A3 3 0 1 0 9 18 3 3 0 1 0 9 12z"></path>
                                        )}
                                        {sm.platform === "TikTok" && (
                                          <path d="M19 10V5h-3a7 7 0 0 1-7 7v3a10 10 0 0 0 10-10"></path>
                                        )}

                                        {sm.platform === "Pinterest" && (
                                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        )}
                                        {sm.platform === "Pinterest" && <line x1="1" y1="1" x2="23" y2="23"></line>}

                                        {sm.platform === "Snapchat" && (
                                          <path d="M12 2c-2.8 0-5 2.2-5 5v3c0 1.1-.9 2-2 2a1 1 0 0 0 0 2h1a1 1 0 0 1 1 1v1a5 5 0 0 0 5 5c2.8 0 5-2.2 5-5v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 0-2c-1.1 0-2-.9-2-2V7c0-2.8-2.2-5-5-5z"></path>
                                        )}

                                        {sm.platform === "GitHub" && (
                                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                        )}

                                        {sm.platform === "Dribbble" && <circle cx="12" cy="12" r="10"></circle>}
                                        {sm.platform === "Dribbble" && (
                                          <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path>
                                        )}

                                        {sm.platform === "Behance" && (
                                          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"></path>
                                        )}
                                        {sm.platform === "Behance" && <path d="M8 10h4v2H8v-2z"></path>}
                                        {sm.platform === "Behance" && (
                                          <path d="M15 8h-2v8h2c2 0 3-1 3-4s-1-4-3-4z"></path>
                                        )}

                                        {sm.platform === "Medium" && <path d="M12 19l7-7 3 3-7 7-3-3z"></path>}
                                        {sm.platform === "Medium" && (
                                          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L18 13z"></path>
                                        )}
                                        {sm.platform === "Medium" && <path d="M2 2l7.586 7.586"></path>}
                                        {sm.platform === "Medium" && <circle cx="11" cy="11" r="2"></circle>}

                                        {sm.platform === "Website" && <circle cx="12" cy="12" r="10"></circle>}
                                        {sm.platform === "Website" && <line x1="2" y1="12" x2="22" y2="12"></line>}
                                        {sm.platform === "Website" && (
                                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                        )}
                                      </svg>
                                      <span>{sm.platform}</span>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground">Select a platform</span>
                                  )}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 ml-auto"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>

                                {/* Social Media Platform Popup */}
                                <div className="absolute z-10 mt-1 w-full bg-card rounded-md shadow-lg border border-border overflow-hidden hidden group-hover:block">
                                  <div className="max-h-60 overflow-y-auto p-2 grid grid-cols-2 gap-1">
                                    {socialPlatforms.map((platform) => (
                                      <div
                                        key={platform.name}
                                        className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                                        onClick={() => updateSocialMedia(i, "platform", platform.name)}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-5 w-5 text-primary"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          {platform.name === "Instagram" && (
                                            <>
                                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                              <path d="M17.5 6.5h.01"></path>
                                            </>
                                          )}
                                          {platform.name === "Facebook" && (
                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                          )}
                                          {platform.name === "Twitter" && (
                                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                          )}
                                          {platform.name === "LinkedIn" && (
                                            <>
                                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                              <rect x="2" y="9" width="4" height="12"></rect>
                                              <circle cx="4" cy="4" r="2"></circle>
                                            </>
                                          )}
                                          {platform.name === "YouTube" && (
                                            <>
                                              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                                              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                                            </>
                                          )}
                                          {platform.name === "TikTok" && (
                                            <>
                                              <path d="M9 12A3 3 0 1 0 9 18 3 3 0 1 0 9 12z"></path>
                                              <path d="M19 10V5h-3a7 7 0 0 1-7 7v3a10 10 0 0 0 10-10"></path>
                                            </>
                                          )}
                                          {platform.name === "Pinterest" && (
                                            <>
                                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                              <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </>
                                          )}
                                          {platform.name === "Snapchat" && (
                                            <path d="M12 2c-2.8 0-5 2.2-5 5v3c0 1.1-.9 2-2 2a1 1 0 0 0 0 2h1a1 1 0 0 1 1 1v1a5 5 0 0 0 5 5c2.8 0 5-2.2 5-5v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 0-2c-1.1 0-2-.9-2-2V7c0-2.8-2.2-5-5-5z"></path>
                                          )}
                                          {platform.name === "GitHub" && (
                                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                          )}
                                          {platform.name === "Dribbble" && (
                                            <>
                                              <circle cx="12" cy="12" r="10"></circle>
                                              <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path>
                                            </>
                                          )}
                                          {platform.name === "Behance" && (
                                            <>
                                              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"></path>
                                              <path d="M8 10h4v2H8v-2z"></path>
                                              <path d="M15 8h-2v8h2c2 0 3-1 3-4s-1-4-3-4z"></path>
                                            </>
                                          )}
                                          {platform.name === "Medium" && (
                                            <>
                                              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                                              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L18 13z"></path>
                                              <path d="M2 2l7.586 7.586"></path>
                                              <circle cx="11" cy="11" r="2"></circle>
                                            </>
                                          )}
                                          {platform.name === "Website" && (
                                            <>
                                              <circle cx="12" cy="12" r="10"></circle>
                                              <line x1="2" y1="12" x2="22" y2="12"></line>
                                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                            </>
                                          )}
                                        </svg>
                                        <span>{platform.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1">URL</label>
                              <input
                                type="url"
                                value={sm.url}
                                onChange={(e) => updateSocialMedia(i, "url", e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={addSocialMedia}
                        className="inline-flex items-center px-4 py-2 border border-primary/30 rounded-md text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add Social Media
                      </button>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                          Tips for Social Media
                        </h3>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc pl-5">
                          <li>Add all your social media profiles to make it easy for people to connect with you</li>
                          <li>Always use full URLs including https:// (e.g., https://instagram.com/yourusername)</li>
                          <li>For best results, use consistent branding across all platforms</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Actions Tab */}
                  {activeTab === Tab.Actions && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Action Buttons</h2>

                      {formData.action_buttons.map((btn, i) => (
                        <div key={i} className="p-4 border border-border rounded-lg bg-background/50 relative group">
                          <button
                            onClick={() => removeActionButton(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            ×
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1">Label</label>
                              <input
                                type="text"
                                value={btn.label}
                                onChange={(e) => updateActionButton(i, "label", e.target.value)}
                                placeholder="Button label"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1">URL</label>
                              <input
                                type="url"
                                value={btn.url}
                                onChange={(e) => updateActionButton(i, "url", e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={addActionButton}
                        className="inline-flex items-center px-4 py-2 border border-primary/30 rounded-md text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add Action Button
                      </button>

                      <h3 className="text-lg font-semibold text-card-foreground mt-8 mb-4">Floating Actions</h3>

                      {formData.floating_actions.map((fa, i) => (
                        <div key={i} className="p-4 border border-border rounded-lg bg-background/50 relative group">
                          <button
                            onClick={() => removeFloatingAction(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            ×
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1">Type</label>
                              <select
                                value={fa.type}
                                onChange={(e) => updateFloatingAction(i, "type", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                              >
                                <option value="">Select...</option>
                                <option value="Call">Call</option>
                                <option value="SMS">SMS</option>
                                <option value="Email">Email</option>
                                <option value="WhatsApp">WhatsApp</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1">Detail</label>
                              <input
                                type="text"
                                value={fa.url}
                                onChange={(e) => updateFloatingAction(i, "url", e.target.value)}
                                placeholder={
                                  fa.type === "Email"
                                    ? "email@example.com"
                                    : fa.type === "Call" || fa.type === "SMS" || fa.type === "WhatsApp"
                                      ? "+1234567890"
                                      : ""
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={addFloatingAction}
                        className="inline-flex items-center px-4 py-2 border border-primary/30 rounded-md text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add Floating Action
                      </button>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                          Tips for Action Buttons
                        </h3>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc pl-5">
                          <li>Action buttons appear prominently on your card for important links</li>
                          <li>Use clear, action-oriented labels like "Book Now" or "View Menu"</li>
                          <li>Floating actions appear as quick-access buttons for contact methods</li>
                          <li>For phone numbers in floating actions, use format: +1234567890</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Features Tab */}
                  {activeTab === Tab.Features && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Special Features</h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label htmlFor="latitude" className="block text-sm font-medium text-card-foreground mb-1">
                            Latitude
                          </label>
                          <input
                            type="text"
                            id="latitude"
                            name="latitude"
                            value={formData.latitude || ""}
                            onChange={handleChange}
                            placeholder="40.7128"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label htmlFor="longitude" className="block text-sm font-medium text-card-foreground mb-1">
                            Longitude
                          </label>
                          <input
                            type="text"
                            id="longitude"
                            name="longitude"
                            value={formData.longitude || ""}
                            onChange={handleChange}
                            placeholder="-74.0060"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="custom_map_link"
                          className="block text-sm font-medium text-card-foreground mb-1"
                        >
                          Custom Map Link
                        </label>
                        <input
                          type="url"
                          id="custom_map_link"
                          name="custom_map_link"
                          value={formData.custom_map_link || ""}
                          onChange={handleChange}
                          placeholder="https://goo.gl/maps/..."
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="mt-6 p-4 border border-border rounded-lg bg-background/50">
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="is_wifi_allowed"
                            name="is_wifi_allowed"
                            checked={formData.is_wifi_allowed}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-primary focus:ring-primary border-border rounded transition-colors duration-200"
                          />
                          <label htmlFor="is_wifi_allowed" className="ml-2 block text-sm text-card-foreground">
                            Enable WiFi
                          </label>
                        </div>

                        {formData.is_wifi_allowed && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label
                                htmlFor="card_wifi_ssid"
                                className="block text-sm font-medium text-card-foreground mb-1"
                              >
                                WiFi SSID
                              </label>
                              <input
                                type="text"
                                id="card_wifi_ssid"
                                name="card_wifi_ssid"
                                value={formData.card_wifi_ssid || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="card_wifi_password"
                                className="block text-sm font-medium text-card-foreground mb-1"
                              >
                                WiFi Password
                              </label>
                              <input
                                type="text"
                                id="card_wifi_password"
                                name="card_wifi_password"
                                value={formData.card_wifi_password || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                          Tips for Special Features
                        </h3>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc pl-5">
                          <li>Adding latitude and longitude will display a map on your card</li>
                          <li>Custom map link can be used to link to Google Maps or other map services</li>
                          <li>
                            The WiFi feature allows visitors to easily connect to your network by scanning your card
                          </li>
                          <li>For security, only enable WiFi sharing in appropriate business contexts</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Menus Tab */}
                  {activeTab === Tab.Menus && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Menu Management</h2>

                      <div className="p-6 border border-border rounded-lg bg-background/50 text-center">
                        <h3 className="text-lg font-medium text-card-foreground mb-2">Manage Your Menus</h3>
                        <p className="text-muted-foreground mb-4">
                          Create and manage menus for your business card. Add items, categories, and more.
                        </p>
                        <Link
                          to={`/cards/${formData.card_username}/menus`}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Go to Menu Manager
                        </Link>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Tips for Menus</h3>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc pl-5">
                          <li>Create separate menus for different meal times or product categories</li>
                          <li>Add high-quality images to make your menu items more appealing</li>
                          <li>Keep descriptions concise but informative</li>
                          <li>Update your menu regularly to keep customers informed about new items</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Review Tab */}
                  {activeTab === Tab.Review && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Review Your Card</h2>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-background/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-primary mb-2">Identity</h3>
                            <p className="text-card-foreground">
                              <strong>Username:</strong> {formData.card_username}
                            </p>
                            <p className="text-card-foreground">
                              <strong>Display Name:</strong> {formData.display_name}
                            </p>
                            <p className="text-card-foreground">
                              <strong>Business Type:</strong> {formData.business_type || "Not specified"}
                            </p>
                          </div>

                          <div className="bg-background/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-primary mb-2">Contact</h3>
                            <p className="text-card-foreground">
                              <strong>Email:</strong> {formData.card_email || "Not provided"}
                            </p>
                            <p className="text-card-foreground">
                              <strong>Address:</strong> {formData.display_address || "Not provided"}
                            </p>
                          </div>
                        </div>

                        <div className="bg-background/50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-primary mb-2">Bio</h3>
                          <p className="text-card-foreground">{formData.bio || "Not provided"}</p>
                        </div>

                        <div className="bg-background/50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-primary mb-2">Colors</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div
                              className="w-8 h-8 rounded-full border border-border shadow-sm"
                              style={{ backgroundColor: formData.theme_color_1 }}
                              title="Primary Color"
                            ></div>
                            <div
                              className="w-8 h-8 rounded-full border border-border shadow-sm"
                              style={{ backgroundColor: formData.theme_color_2 }}
                              title="Secondary Color"
                            ></div>
                            <div
                              className="w-8 h-8 rounded-full border border-border shadow-sm"
                              style={{ backgroundColor: formData.theme_color_3 }}
                              title="Text Color"
                            ></div>
                          </div>
                        </div>

                        {formData.social_medias.length > 0 && (
                          <div className="bg-background/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-primary mb-2">Social Media</h3>
                            <div className="space-y-1">
                              {formData.social_medias.map((sm, i) => (
                                <p key={i} className="text-card-foreground">
                                  <strong>{sm.platform}:</strong> {sm.url}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {formData.action_buttons.length > 0 && (
                          <div className="bg-background/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-primary mb-2">Action Buttons</h3>
                            <div className="space-y-1">
                              {formData.action_buttons.map((btn, i) => (
                                <p key={i} className="text-card-foreground">
                                  <strong>{btn.label}:</strong> {btn.url}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {formData.floating_actions.length > 0 && (
                          <div className="bg-background/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-primary mb-2">Floating Actions</h3>
                            <div className="space-y-1">
                              {formData.floating_actions.map((fa, i) => (
                                <p key={i} className="text-card-foreground">
                                  <strong>{fa.type}:</strong> {fa.url}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {formData.is_wifi_allowed && (
                          <div className="bg-background/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-primary mb-2">WiFi Details</h3>
                            <p className="text-card-foreground">
                              <strong>SSID:</strong> {formData.card_wifi_ssid || "Not provided"}
                            </p>
                            <p className="text-card-foreground">
                              <strong>Password:</strong> {formData.card_wifi_password ? "******" : "Not provided"}
                            </p>
                          </div>
                        )}

                        {(formData.latitude || formData.longitude || formData.custom_map_link) && (
                          <div className="bg-background/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-primary mb-2">Location</h3>
                            <p className="text-card-foreground">
                              <strong>Latitude:</strong> {formData.latitude || "Not provided"}
                            </p>
                            <p className="text-card-foreground">
                              <strong>Longitude:</strong> {formData.longitude || "Not provided"}
                            </p>
                            <p className="text-card-foreground">
                              <strong>Map Link:</strong> {formData.custom_map_link || "Not provided"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-4">
                          Please review your card details above and in the preview. Once you're satisfied, click "Save
                          Changes" to update your card.
                        </p>
                        <button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div className="bg-card rounded-xl shadow-md border border-border p-6 transition-colors duration-300 sticky top-24 hover:shadow-lg">
              <h2 className="text-xl font-bold text-card-foreground mb-6 text-center">Card Preview</h2>
              <div className="transform transition-all duration-300 hover:scale-105">
                <CardPreview card={formData as Partial<Card>} />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                This is how your card will appear to others
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper */}
      <ImageCropper
        isOpen={showCropper}
        imageUrl={tempImageUrl}
        onClose={() => setShowCropper(false)}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
      />
    </div>
  )
}

export default CardEditor

