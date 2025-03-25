"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import CardService from "../services/CardService"
import CardPreview from "./CardPreview"
import type { Card } from "../types/card"
import ImageCropper from "./ImageCropper"

const CardCreator: React.FC = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<Partial<Card>>({
    card_username: "",
    display_name: "",
    bio: "",
    card_email: "",
    display_address: "",
    theme_color_1: "#4a90e2",
    theme_color_2: "#ffffff",
    theme_color_3: "#333333",
  })
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string>("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)

    try {
      await CardService.createCard(formData)
      setMessage({ type: "success", text: "Card created successfully!" })
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

  const handleCropComplete = (croppedImageUrl: string) => {
    setFormData({
      ...formData,
      card_pic: croppedImageUrl,
    })
  }

  return (
    <div className="bg-[#121826] min-h-screen pt-20 pb-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Create New Card</h1>
          <Link to="/" className="flex items-center text-[#4169E1] hover:text-[#5A7BF0] hover:underline">
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

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "error"
                ? "bg-red-900/20 text-red-400 border-l-4 border-red-500"
                : "bg-green-900/20 text-green-400 border-l-4 border-green-500"
            }`}
          >
            <p>{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-[#1E293B] rounded-xl shadow-md border border-[#2D3748] p-6 transition-colors duration-300">
              <div className="space-y-6">
                <div>
                  <label htmlFor="card_username" className="block text-sm font-medium text-gray-300 mb-1">
                    Username (URL)*
                  </label>
                  <input
                    type="text"
                    id="card_username"
                    name="card_username"
                    value={formData.card_username}
                    onChange={handleChange}
                    required
                    placeholder="e.g. john-doe"
                    className="w-full px-4 py-3 rounded-lg border border-[#2D3748] bg-[#121826] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-400">
                    This will be used in your card URL. Use only letters, numbers, and hyphens.
                  </p>
                </div>

                <div>
                  <label htmlFor="display_name" className="block text-sm font-medium text-gray-300 mb-1">
                    Display Name*
                  </label>
                  <input
                    type="text"
                    id="display_name"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 rounded-lg border border-[#2D3748] bg-[#121826] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself or your business"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-[#2D3748] bg-[#121826] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="card_email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="card_email"
                    name="card_email"
                    value={formData.card_email}
                    onChange={handleChange}
                    placeholder="e.g. john@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-[#2D3748] bg-[#121826] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="profile_pic" className="block text-sm font-medium text-gray-300 mb-1">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {formData.card_pic ? (
                        <img
                          src={formData.card_pic || "/placeholder.svg"}
                          alt="Profile preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#4169E1]"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#2D3748] flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-gray-400"
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
                    </div>
                    <div className="flex-grow">
                      <input
                        type="file"
                        id="profile_pic"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="profile_pic"
                        className="inline-flex items-center px-4 py-2 border border-[#2D3748] rounded-md shadow-sm text-sm font-medium text-gray-300 bg-[#121826] hover:bg-[#2D3748] focus:outline-none cursor-pointer transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-gray-400"
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

                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4169E1] hover:bg-[#3A5CD0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4169E1] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Card"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div className="bg-[#1E293B] rounded-xl shadow-md border border-[#2D3748] p-6 transition-colors duration-300 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6 text-center">Card Preview</h2>
              <CardPreview card={formData} />
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

