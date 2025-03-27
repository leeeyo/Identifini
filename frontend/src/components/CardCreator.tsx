"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import CardService from "../services/CardService"
import CardPreview from "./CardPreview"
import type { Card } from "../types/card"
import ImageCropper from "./ImageCropper"
import { motion, AnimatePresence } from "framer-motion"

// Define steps for the card creation process
enum Step {
  Identity = 0,
  Bio = 1,
  Email = 2,
  Colors = 3,
  Photo = 4,
  Review = 5,
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

const CardCreator: React.FC = () => {
  const navigate = useNavigate()

  // State for the form data
  const [formData, setFormData] = useState<Partial<Card>>({
    card_username: "",
    display_name: "",
    bio: "",
    card_email: "",
    theme_color_1: "#4a90e2", // Default primary color
    theme_color_2: "#ffffff", // Default secondary color
    theme_color_3: "#333333", // Default text color
  })

  // State for the current step
  const [currentStep, setCurrentStep] = useState<Step>(Step.Identity)

  // State for animation direction (forward or backward)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")

  // State for username suggestions
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])

  // State for loading and messages
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  // State for image cropper
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string>("")

  // State for validation
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isEmailRequired, setIsEmailRequired] = useState(false)

  // Debounced username validation
  const validateUsername = useCallback(async (username: string) => {
    if (!username || username.trim() === "") {
      setUsernameError(null)
      return
    }

    // Check if username contains only valid characters
    const validUsernameRegex = /^[a-zA-Z0-9._-]+$/
    if (!validUsernameRegex.test(username)) {
      setUsernameError("Username can only contain letters, numbers, periods, underscores, and hyphens")
      return
    }

    try {
      setIsCheckingUsername(true)
      // Check if username already exists
      const response = await CardService.checkUsernameAvailability(username)

      if (response && response.exists) {
        setUsernameError("This username is already taken")
      } else {
        setUsernameError(null)
      }
    } catch (err) {
      console.error("Error checking username:", err)
      // Don't set error if it's just a validation check failure
    } finally {
      setIsCheckingUsername(false)
    }
  }, [])

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

  // Validate username when it changes
  useEffect(() => {
    if (formData.card_username) {
      const timer = setTimeout(() => {
        validateUsername(formData.card_username || "")
      }, 500) // Debounce for 500ms

      return () => clearTimeout(timer)
    }
  }, [formData.card_username, validateUsername])

  // Validate email when it changes
  useEffect(() => {
    if (formData.card_email) {
      validateEmail(formData.card_email)
    }
  }, [formData.card_email])

  // Generate username suggestions when display name changes
  useEffect(() => {
    if (formData.display_name) {
      const name = formData.display_name.toLowerCase().trim()

      // Split name into parts (for first/last name combinations)
      const nameParts = name.split(/\s+/)
      const firstName = nameParts[0] || ""
      const lastName = nameParts[nameParts.length - 1] || ""

      // Generate more varied suggestions based on display name
      const suggestions = [
        name.replace(/\s+/g, ""), // No spaces
        name.replace(/\s+/g, "-"), // Hyphenated
      ]

      // Add more varied suggestions
      if (nameParts.length > 1) {
        // If there are multiple name parts (first/last name)
        suggestions.push(
          `${firstName}${lastName.charAt(0)}`, // first name + first letter of last name
          `${firstName}.${lastName}`, // first.last
          `${lastName}.${firstName}`, // last.first
        )
      } else {
        // If it's a single name/word
        suggestions.push(
          `${name}${Math.floor(Math.random() * 1000)}`, // name + random number
          `${name}.${new Date().getFullYear()}`, // name + year
          `the.${name}`, // the.name
        )
      }

      // Filter out duplicates and empty strings without using Set
      const uniqueSuggestions = suggestions
        .filter((value, index, self) => {
          return self.indexOf(value) === index && value.trim() !== ""
        })
        .slice(0, 5) // Limit to 5 suggestions

      setUsernameSuggestions(uniqueSuggestions)
    } else {
      setUsernameSuggestions([])
    }
  }, [formData.display_name])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle username suggestion selection
  const handleSelectUsername = (username: string) => {
    setFormData({
      ...formData,
      card_username: username,
    })
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

  // Handle file selection for profile picture
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setTempImageUrl(reader.result as string)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
  }

  // Handle crop completion
  const handleCropComplete = (croppedImageUrl: string) => {
    setFormData({
      ...formData,
      card_pic: croppedImageUrl,
    })
  }

  // Navigate to next step
  const handleNext = () => {
    // Validate current step
    if (currentStep === Step.Identity) {
      if (!formData.card_username || !formData.display_name) {
        setMessage({ type: "error", text: "Username and Display Name are required." })
        return
      }

      if (usernameError) {
        setMessage({ type: "error", text: usernameError })
        return
      }

      if (isCheckingUsername) {
        setMessage({ type: "error", text: "Please wait while we check username availability." })
        return
      }
    }

    if (currentStep === Step.Email) {
      // Only validate email format if one is provided
      if (formData.card_email && !validateEmail(formData.card_email)) {
        setMessage({ type: "error", text: emailError || "Please enter a valid email address" })
        return
      }
    }

    setDirection("forward")
    setCurrentStep((prev) => (prev < Step.Review ? ((prev + 1) as Step) : prev))
    setMessage(null)
  }

  // Navigate to previous step
  const handlePrevious = () => {
    setDirection("backward")
    setCurrentStep((prev) => (prev > Step.Identity ? ((prev - 1) as Step) : prev))
    setMessage(null)
  }

  // Submit the form
  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // Basic validation
      if (!formData.card_username || !formData.display_name) {
        setMessage({ type: "error", text: "Username and Display Name are required." })
        setLoading(false)
        return
      }

      // Validate email format if provided
      if (formData.card_email && emailError) {
        setMessage({ type: "error", text: emailError })
        setLoading(false)
        return
      }

      await CardService.createCard(formData)
      setMessage({ type: "success", text: "Card created successfully!" })

      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setMessage({
        type: "error",
        text: err.response?.data?.error || err.message || "Submission failed.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress percentage
  const progressPercentage = (currentStep / Step.Review) * 100

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

  return (
    <div className="bg-background-dark min-h-screen pt-20 pb-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-card-foreground">Create New Card</h1>
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

        {/* Progress Bar - Enhanced with step labels */}
        <div className="mb-8">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            {Object.keys(Step)
              .filter((key) => !isNaN(Number(key)))
              .map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      index <= currentStep ? "bg-primary" : "bg-muted"
                    } transition-colors duration-300`}
                  ></div>
                </div>
              ))}
          </div>
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
            <div className="bg-card rounded-xl shadow-md border border-border p-6 transition-colors duration-300 min-h-[400px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-full"
                >
                  {/* Step 1: Identity */}
                  {currentStep === Step.Identity && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Let's start with your identity</h2>

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
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          This is the name that will be displayed on your card.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="card_username" className="block text-sm font-medium text-card-foreground mb-1">
                          Username (URL)*
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="card_username"
                            name="card_username"
                            value={formData.card_username}
                            onChange={handleChange}
                            required
                            placeholder="e.g. john-doe"
                            className={`w-full px-4 py-3 rounded-lg border ${
                              usernameError ? "border-red-500 dark:border-red-400" : "border-border"
                            } bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                              usernameError ? "focus:ring-red-500" : "focus:ring-primary"
                            } focus:border-transparent pr-10 transition-all duration-200`}
                          />
                          {isCheckingUsername && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                          )}
                          {!isCheckingUsername && formData.card_username && !usernameError && (
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
                        {usernameError && (
                          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{usernameError}</p>
                        )}
                        <p className="mt-1 text-sm text-muted-foreground">
                          This will be used in your card URL. Use only letters, numbers, and hyphens.
                        </p>
                      </div>

                      {/* Username Suggestions */}
                      {usernameSuggestions.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">
                            Username Suggestions
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {usernameSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleSelectUsername(suggestion)}
                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors border border-primary/20 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Bio */}
                  {currentStep === Step.Bio && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Tell us about yourself</h2>

                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-card-foreground mb-1">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Tell us about yourself or your business"
                          rows={6}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          A short description that will appear on your card. Keep it concise and engaging.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Email */}
                  {currentStep === Step.Email && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Contact Information</h2>

                      <div>
                        <label htmlFor="card_email" className="block text-sm font-medium text-card-foreground mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            id="card_email"
                            name="card_email"
                            value={formData.card_email}
                            onChange={handleChange}
                            placeholder="e.g. john@example.com"
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
                        <p className="mt-1 text-sm text-muted-foreground">
                          Your email address will be displayed on your card if provided.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="display_address"
                          className="block text-sm font-medium text-card-foreground mb-1"
                        >
                          Address (Optional)
                        </label>
                        <input
                          type="text"
                          id="display_address"
                          name="display_address"
                          value={formData.display_address || ""}
                          onChange={handleChange}
                          placeholder="e.g. 123 Main St, City, Country"
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Colors */}
                  {currentStep === Step.Colors && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Choose your card colors</h2>

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
                    </div>
                  )}

                  {/* Step 5: Photo */}
                  {currentStep === Step.Photo && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Add a profile picture</h2>

                      <div className="flex flex-col items-center justify-center py-6">
                        {formData.card_pic ? (
                          <div className="mb-6 relative group">
                            <img
                              src={formData.card_pic || "/placeholder.svg"}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg transition-all duration-300 group-hover:shadow-xl"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                              <label
                                htmlFor="profile_pic"
                                className="cursor-pointer text-transparent group-hover:text-white font-medium"
                              >
                                Change
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-16 w-16 text-primary/50"
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

                        <input
                          type="file"
                          id="profile_pic"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label
                          htmlFor="profile_pic"
                          className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-card-foreground bg-background hover:bg-muted focus:outline-none cursor-pointer transition-colors duration-200 hover:shadow-md"
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

                        <p className="mt-4 text-sm text-muted-foreground text-center max-w-md">
                          Add a professional photo to make your card more personal. We recommend using a square image
                          with your face clearly visible.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Review */}
                  {currentStep === Step.Review && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-card-foreground mb-4">Review your card</h2>

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
                      </div>

                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-4">
                          Please review your card details above and in the preview. Once you're satisfied, click "Create
                          Card" to finish.
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
                              Creating...
                            </span>
                          ) : (
                            "Create Card"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentStep === Step.Identity}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentStep === Step.Identity
                    ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                    : "bg-muted hover:bg-muted/80 text-card-foreground hover:shadow-md"
                }`}
              >
                Previous
              </button>

              {currentStep < Step.Review ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Next
                </button>
              ) : null}
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div className="bg-card rounded-xl shadow-md border border-border p-6 transition-colors duration-300 sticky top-24 hover:shadow-lg">
              <h2 className="text-xl font-bold text-card-foreground mb-6 text-center">Card Preview</h2>
              <div className="transform transition-all duration-300 hover:scale-105">
                <CardPreview card={formData} />
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

export default CardCreator

