"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profilePicture: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // For profile picture preview
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        profilePicture: user.profilePicture || "",
      })
      setPreviewImage(user.profilePicture || null)
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size - limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreviewImage(result)
      setFormData((prev) => ({
        ...prev,
        profilePicture: result,
      }))
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Make sure we're sending the profile picture in the update
      await updateProfile({
        name: formData.name,
        email: formData.email,
        profilePicture: formData.profilePicture,
      })

      setSuccess("Profile updated successfully!")

      // Force a refresh of components that use the user data
      const event = new Event("storage")
      window.dispatchEvent(event)
    } catch (err: any) {
      console.error("Profile update error:", err)
      setError(err.response?.data?.error || "Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-[70px]">
        <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121826] pt-[70px]">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Column - User Info */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8 flex flex-col items-center">
                {/* Profile Picture with Change Option */}
                <div className="relative mb-4 group">
                  <div
                    className="w-32 h-32 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt={user.name || user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user.name?.charAt(0) || user.username?.charAt(0) || "U"}</span>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">Change Photo</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || user.username}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700">
                <nav>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full text-left px-6 py-3 ${
                      activeTab === "profile"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`w-full text-left px-6 py-3 ${
                      activeTab === "security"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    Security
                  </button>
                  <button
                    onClick={() => setActiveTab("subscription")}
                    className={`w-full text-left px-6 py-3 ${
                      activeTab === "subscription"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    Subscription
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              {activeTab === "profile" && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                      <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                      <p className="text-green-600 dark:text-green-400">{success}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={user.username}
                          disabled
                          className="w-full px-4 py-3 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                        />
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Username cannot be changed</p>
                      </div>

                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>

                        {/* Profile Picture Change Button */}
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                          Change Profile Picture
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}

              {activeTab === "security" && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Password management and security settings will be available in a future update.
                  </p>
                </>
              )}

              {activeTab === "subscription" && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Subscription</h2>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Free Plan</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Your current plan</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">
                        Active
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-500 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Up to 5 digital business cards</span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-500 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Basic analytics</span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-500 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Standard templates</span>
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Upgrade to Pro
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

