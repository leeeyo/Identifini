"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import CardPreview from "./CardPreview"
import CardService from "../services/CardService"
import ImageCropper from "./ImageCropper"
import "./CardCreator.css"

// Define tab names for the re-imagined UI
enum Tab {
  Basic = "Basic",
  Appearance = "Appearance",
  Social = "Social",
  Actions = "Actions",
  Features = "Features",
  Review = "Review",
}

// Interfaces (reuse as needed)
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

const CardCreator: React.FC = () => {
  const navigate = useNavigate()

  // Active tab state
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Basic)
  const [formData, setFormData] = useState<CardFormData>(initialFormData)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  // Image Cropper State
  const [showCropper, setShowCropper] = useState(false)
  const [selectedFileType, setSelectedFileType] = useState<"profile" | "gallery" | null>(null)
  const [tempImageUrl, setTempImageUrl] = useState<string>("")

  // For slide transitions between tabs
  const [transitionClass, setTransitionClass] = useState("slide-in")

  const handleTabChange = (tab: Tab) => {
    // Trigger a slide-out then slide-in
    setTransitionClass("slide-out")
    setTimeout(() => {
      setActiveTab(tab)
      setTransitionClass("slide-in")
    }, 250)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)
    // Basic validation for demonstration
    if (!formData.card_username.trim() || !formData.display_name.trim()) {
      setMessage({ type: "error", text: "Username and Display Name are required." })
      setLoading(false)
      return
    }
    try {
      const cardData = { ...formData }
      await CardService.createCard(cardData)
      setMessage({ type: "success", text: "Card created successfully!" })
      setTimeout(() => navigate("/"), 2000)
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

  // Form Field Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
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

  return (
    <div className="card-creator-container">
      <header className="creator-header">
        <h1>Create Your Card</h1>
        <nav className="creator-nav">
          {Object.values(Tab).map((tab) => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="creator-main">
        <section className={`editor-section ${transitionClass}`}>
          {message && <div className={`message ${message.type}`}>{message.text}</div>}

          {activeTab === Tab.Basic && (
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="input-group">
                <label>Username (URL)*</label>
                <input
                  type="text"
                  name="card_username"
                  value={formData.card_username}
                  onChange={handleChange}
                  placeholder="e.g. john-doe"
                />
              </div>
              <div className="input-group">
                <label>Display Name*</label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="input-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself or your business"
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="card_email"
                  value={formData.card_email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>
              <div className="input-group">
                <label>Business Type</label>
                <select name="business_type" value={formData.business_type || ""} onChange={handleChange}>
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
              <div className="input-group file-input">
                <label>Profile Picture</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, "profile")} />
                {formData.card_pic && (
                  <div className="image-preview">
                    <img src={formData.card_pic || "/placeholder.svg"} alt="Profile" />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === Tab.Appearance && (
            <div className="form-section">
              <h2>Appearance</h2>
              <div className="input-group">
                <label>Address</label>
                <input
                  type="text"
                  name="display_address"
                  value={formData.display_address || ""}
                  onChange={handleChange}
                  placeholder="123 Main St"
                />
              </div>
              <div className="color-row">
                <div className="input-group">
                  <label>Primary Color</label>
                  <input type="color" name="theme_color_1" value={formData.theme_color_1} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Secondary Color</label>
                  <input type="color" name="theme_color_2" value={formData.theme_color_2} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Text Color</label>
                  <input type="color" name="theme_color_3" value={formData.theme_color_3} onChange={handleChange} />
                </div>
              </div>
              <div className="input-group file-input">
                <label>Gallery Photo</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, "gallery")} />
              </div>
              {formData.extra_photos.length > 0 && (
                <div className="gallery-preview">
                  {formData.extra_photos.map((photo, i) => (
                    <div key={i} className="gallery-item">
                      <img src={photo || "/placeholder.svg"} alt={`Extra ${i + 1}`} />
                      <button onClick={() => {
                        const updated = [...formData.extra_photos]
                        updated.splice(i, 1)
                        setFormData((prev) => ({ ...prev, extra_photos: updated }))
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === Tab.Social && (
            <div className="form-section">
              <h2>Social Media</h2>
              {formData.social_medias.map((sm, i) => (
                <div key={i} className="dynamic-group">
                  <div className="input-group">
                    <label>Platform</label>
                    <input
                      type="text"
                      value={sm.platform}
                      onChange={(e) => updateSocialMedia(i, "platform", e.target.value)}
                      placeholder="e.g. Instagram"
                    />
                  </div>
                  <div className="input-group">
                    <label>URL</label>
                    <input
                      type="url"
                      value={sm.url}
                      onChange={(e) => updateSocialMedia(i, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <button className="remove-btn" onClick={() => removeSocialMedia(i)}>Remove</button>
                </div>
              ))}
              <button className="add-btn" onClick={addSocialMedia}>+ Add Social Media</button>
            </div>
          )}

          {activeTab === Tab.Actions && (
            <div className="form-section">
              <h2>Action Buttons</h2>
              {formData.action_buttons.map((btn, i) => (
                <div key={i} className="dynamic-group">
                  <div className="input-group">
                    <label>Label</label>
                    <input
                      type="text"
                      value={btn.label}
                      onChange={(e) => updateActionButton(i, "label", e.target.value)}
                      placeholder="Button label"
                    />
                  </div>
                  <div className="input-group">
                    <label>URL</label>
                    <input
                      type="url"
                      value={btn.url}
                      onChange={(e) => updateActionButton(i, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <button className="remove-btn" onClick={() => removeActionButton(i)}>Remove</button>
                </div>
              ))}
              <button className="add-btn" onClick={addActionButton}>+ Add Action Button</button>
            </div>
          )}

          {activeTab === Tab.Features && (
            <div className="form-section">
              <h2>Special Features</h2>
              <div className="input-group">
                <label>Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude || ""}
                  onChange={handleChange}
                  placeholder="40.7128"
                />
              </div>
              <div className="input-group">
                <label>Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude || ""}
                  onChange={handleChange}
                  placeholder="-74.0060"
                />
              </div>
              <div className="input-group">
                <label>Custom Map Link</label>
                <input
                  type="url"
                  name="custom_map_link"
                  value={formData.custom_map_link || ""}
                  onChange={handleChange}
                  placeholder="https://goo.gl/maps/..."
                />
              </div>
              <div className="input-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_wifi_allowed"
                    checked={formData.is_wifi_allowed}
                    onChange={handleCheckboxChange}
                  /> Enable WiFi
                </label>
              </div>
              {formData.is_wifi_allowed && (
                <>
                  <div className="input-group">
                    <label>WiFi SSID</label>
                    <input
                      type="text"
                      name="card_wifi_ssid"
                      value={formData.card_wifi_ssid || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input-group">
                    <label>WiFi Password</label>
                    <input
                      type="text"
                      name="card_wifi_password"
                      value={formData.card_wifi_password || ""}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === Tab.Review && (
            <div className="form-section">
              <h2>Review Your Card</h2>
              <p><strong>Username:</strong> {formData.card_username}</p>
              <p><strong>Display Name:</strong> {formData.display_name}</p>
              <p><strong>Email:</strong> {formData.card_email || "N/A"}</p>
              <p><strong>Bio:</strong> {formData.bio || "N/A"}</p>
              <p><strong>Business Type:</strong> {formData.business_type || "N/A"}</p>
              <p><strong>Address:</strong> {formData.display_address || "N/A"}</p>
              <p><strong>Colors:</strong> {formData.theme_color_1}, {formData.theme_color_2}, {formData.theme_color_3}</p>
              {/* Additional review details can be added here */}
            </div>
          )}
        </section>

        <aside className="preview-panel">
          <h2>Live Preview</h2>
          <CardPreview card={formData as Partial<any>} />
        </aside>
      </main>

      <footer className="creator-footer">
        <button className="submit-button" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Create Card"}
        </button>
      </footer>

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
