"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import ImageCropper from "../ImageCropper"
import "./Profile.css"
import ThemeToggle from "../common/ThemeToggle"

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
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Image cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string>("")

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        profilePicture: user.profilePicture || "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Instead of directly setting the profile picture, show the cropper
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
      profilePicture: croppedImageUrl,
    })
    setShowCropper(false)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Make sure we're sending the profilePicture in the update
      const dataToUpdate = {
        name: formData.name,
        email: formData.email,
        profilePicture: formData.profilePicture,
      }

      console.log("Submitting profile update with data:", dataToUpdate)

      await updateProfile(dataToUpdate)
      setSuccess("Profile updated successfully")
      setIsEditing(false)
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
      <div className="profile-container">
        <div className="profile-card">
          <h1>Profile</h1>
          <p>Please login to view your profile.</p>
          <button onClick={() => navigate("/login")} className="primary-button">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Your Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`modern-edit-button ${isEditing ? "active" : ""}`}
            aria-label={isEditing ? "Cancel editing" : "Edit profile"}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-content">
          <div className="profile-picture-section">
            <div
              className={`profile-picture ${isEditing ? "edit-mode" : ""}`}
              style={{ backgroundImage: formData.profilePicture ? `url(${formData.profilePicture})` : "none" }}
              onClick={isEditing ? triggerFileInput : undefined}
            >
              {!formData.profilePicture && (
                <span className="profile-initial">{user.name?.charAt(0) || user.username?.charAt(0) || "U"}</span>
              )}
              {isEditing && (
                <div className="profile-picture-overlay always-visible">
                  <span className="upload-icon">+</span>
                </div>
              )}
            </div>
            {isEditing && (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden-file-input"
              />
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <div className="static-field">{user.username}</div>
                <p className="field-note">Username cannot be changed</p>
              </div>
              <div className="form-group">
                <label>Role</label>
                <div className="static-field">{user.role}</div>
              </div>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-group">
                <h3>Full Name</h3>
                <p>{formData.name || "Not provided"}</p>
              </div>
              <div className="detail-group">
                <h3>Email</h3>
                <p>{formData.email || "Not provided"}</p>
              </div>
              <div className="detail-group">
                <h3>Username</h3>
                <p>{user.username}</p>
              </div>
              <div className="detail-group">
                <h3>Role</h3>
                <p>{user.role}</p>
              </div>
              <div className="detail-group">
                <h3>Account Created</h3>
                <p>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p>
              </div>
              <div className="detail-group">
                <h3>Theme Preference</h3>
                <div className="flex items-center gap-2">
                  <p>{user.themePreference || "System default"}</p>
                  <ThemeToggle className="ml-2" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
          <button onClick={() => navigate("/")} className="secondary-button">
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Image Cropper Component */}
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

export default Profile

