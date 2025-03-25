"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import CardService from "../services/CardService"
import CardPreview from "./CardPreview"
import { useAuth } from "../context/AuthContext"
import type { Card } from "../types/card"
import "./CreateCardWizard.css"

// Define the stages of the card creation process
enum CreationStage {
  BasicInfo = 0,
  Appearance = 1,
  SocialMedia = 2,
  ActionButtons = 3,
  SpecialFeatures = 4,
  Review = 5,
}

// Define the form data structure
interface CardFormData {
  card_username: string
  display_name: string
  bio?: string
  card_email?: string
  display_address?: string
  theme_color_1?: string
  theme_color_2?: string
  theme_color_3?: string
  social_medias: Array<{
    platform: string
    url: string
    icon?: string
  }>
  action_buttons: Array<{
    label: string
    url: string
    icon?: string
  }>
  floating_actions: Array<{
    type: string
    url: string
    icon?: string
  }>
  card_pic?: string
  card_wifi_ssid?: string
  card_wifi_password?: string
  latitude?: string
  longitude?: string
  custom_map_link?: string
  extra_photos: string[]
  business_type?: string
  is_wifi_allowed: boolean
}

const CreateCardWizard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStage, setCurrentStage] = useState<CreationStage>(CreationStage.BasicInfo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialize form data with default values
  const [formData, setFormData] = useState<CardFormData>({
    card_username: "",
    display_name: "",
    bio: "",
    card_email: "",
    display_address: "",
    theme_color_1: "#4a90e2", // Blue theme by default
    theme_color_2: "#ffffff",
    theme_color_3: "#333333",
    social_medias: [],
    action_buttons: [],
    floating_actions: [],
    extra_photos: [],
    is_wifi_allowed: false,
  })

  // Business types for conditional fields
  const businessTypes = [
    { value: "personal", label: "Personal" },
    { value: "restaurant", label: "Restaurant/Café", wifiAllowed: true },
    { value: "retail", label: "Retail Store" },
    { value: "service", label: "Service Business" },
    { value: "hotel", label: "Hotel/Accommodation", wifiAllowed: true },
    { value: "professional", label: "Professional (Doctor, Lawyer, etc.)" },
    { value: "other", label: "Other" },
  ]

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "business_type") {
      const selectedType = businessTypes.find((type) => type.value === value)
      setFormData({
        ...formData,
        [name]: value,
        is_wifi_allowed: !!selectedType?.wifiAllowed,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  // Handle social media changes
  const handleSocialMediaChange = (index: number, field: string, value: string) => {
    const updatedSocialMedia = [...formData.social_medias]
    updatedSocialMedia[index] = {
      ...updatedSocialMedia[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      social_medias: updatedSocialMedia,
    })
  }

  // Add new social media
  const addSocialMedia = () => {
    setFormData({
      ...formData,
      social_medias: [...formData.social_medias, { platform: "", url: "", icon: "fa-globe" }],
    })
  }

  // Remove social media
  const removeSocialMedia = (index: number) => {
    const updatedSocialMedia = [...formData.social_medias]
    updatedSocialMedia.splice(index, 1)
    setFormData({
      ...formData,
      social_medias: updatedSocialMedia,
    })
  }

  // Handle action button changes
  const handleActionButtonChange = (index: number, field: string, value: string) => {
    const updatedActionButtons = [...formData.action_buttons]
    updatedActionButtons[index] = {
      ...updatedActionButtons[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      action_buttons: updatedActionButtons,
    })
  }

  // Add new action button
  const addActionButton = () => {
    setFormData({
      ...formData,
      action_buttons: [...formData.action_buttons, { label: "", url: "", icon: "link" }],
    })
  }

  // Remove action button
  const removeActionButton = (index: number) => {
    const updatedActionButtons = [...formData.action_buttons]
    updatedActionButtons.splice(index, 1)
    setFormData({
      ...formData,
      action_buttons: updatedActionButtons,
    })
  }

  // Handle floating action changes
  const handleFloatingActionChange = (index: number, field: string, value: string) => {
    const updatedFloatingActions = [...formData.floating_actions]
    updatedFloatingActions[index] = {
      ...updatedFloatingActions[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      floating_actions: updatedFloatingActions,
    })
  }

  // Add new floating action
  const addFloatingAction = () => {
    setFormData({
      ...formData,
      floating_actions: [...formData.floating_actions, { type: "", url: "", icon: "fa-link" }],
    })
  }

  // Remove floating action
  const removeFloatingAction = (index: number) => {
    const updatedFloatingActions = [...formData.floating_actions]
    updatedFloatingActions.splice(index, 1)
    setFormData({
      ...formData,
      floating_actions: updatedFloatingActions,
    })
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real implementation, you would upload this to your server or a storage service
    // For now, we'll just create a data URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({
        ...formData,
        card_pic: reader.result as string,
      })
    }
    reader.readAsDataURL(file)
  }

  // Handle extra photo upload
  const handleExtraPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real implementation, you would upload this to your server or a storage service
    // For now, we'll just create a data URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({
        ...formData,
        extra_photos: [...formData.extra_photos, reader.result as string],
      })
    }
    reader.readAsDataURL(file)
  }

  // Remove extra photo
  const removeExtraPhoto = (index: number) => {
    const updatedExtraPhotos = [...formData.extra_photos]
    updatedExtraPhotos.splice(index, 1)
    setFormData({
      ...formData,
      extra_photos: updatedExtraPhotos,
    })
  }

  // Move to next stage
  const nextStage = () => {
    if (currentStage === CreationStage.BasicInfo) {
      // Validate basic info
      if (!formData.card_username || !formData.display_name) {
        setError("Username and display name are required")
        return
      }

      // Validate username format (alphanumeric and hyphens only)
      const usernameRegex = /^[a-zA-Z0-9-]+$/
      if (!usernameRegex.test(formData.card_username)) {
        setError("Username can only contain letters, numbers, and hyphens")
        return
      }
    }

    setError(null)
    setCurrentStage((prevStage) => prevStage + 1)
    window.scrollTo(0, 0)
  }

  // Move to previous stage
  const prevStage = () => {
    setError(null)
    setCurrentStage((prevStage) => prevStage - 1)
    window.scrollTo(0, 0)
  }

  // Jump to a specific stage
  const jumpToStage = (stage: CreationStage) => {
    if (stage <= currentStage) {
      setCurrentStage(stage)
      window.scrollTo(0, 0)
    }
  }

  // Submit the form
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Convert form data to match Card type
      const cardData: Partial<Card> = {
        ...formData,
        // Ensure these are properly formatted for the API
        social_medias: formData.social_medias,
        action_buttons: formData.action_buttons,
        floating_actions: formData.floating_actions,
        extra_photos: formData.extra_photos,
      }

      // Create the card with the current user
      await CardService.createCard(cardData)
      setSuccess("Card created successfully!")

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (err: any) {
      console.error("API Error details:", err)

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.")
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError(err.message || "Failed to create card")
      }
    } finally {
      setLoading(false)
    }
  }

  // Get stage name
  const getStageName = (stage: CreationStage): string => {
    switch (stage) {
      case CreationStage.BasicInfo:
        return "Basic Info"
      case CreationStage.Appearance:
        return "Appearance"
      case CreationStage.SocialMedia:
        return "Social Media"
      case CreationStage.ActionButtons:
        return "Action Buttons"
      case CreationStage.SpecialFeatures:
        return "Special Features"
      case CreationStage.Review:
        return "Review"
      default:
        return ""
    }
  }

  // Render the current stage
  const renderStage = () => {
    switch (currentStage) {
      case CreationStage.BasicInfo:
        return (
          <div className="wizard-stage">
            <h2>Basic Information</h2>
            <p className="stage-description">Let's start with the essential details for your digital card.</p>

            <div className="form-group">
              <label htmlFor="card_username">Username (URL)*</label>
              <input
                type="text"
                id="card_username"
                name="card_username"
                value={formData.card_username}
                onChange={handleChange}
                required
                placeholder="e.g. john-doe"
              />
              <small>This will be used in your card URL. Use only letters, numbers, and hyphens.</small>
            </div>

            <div className="form-group">
              <label htmlFor="display_name">Display Name*</label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                required
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself or your business"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="card_email">Email</label>
              <input
                type="email"
                id="card_email"
                name="card_email"
                value={formData.card_email}
                onChange={handleChange}
                placeholder="e.g. john@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="business_type">Type of Business/Card</label>
              <select
                id="business_type"
                name="business_type"
                value={formData.business_type || ""}
                onChange={handleChange}
              >
                <option value="">Select a type...</option>
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <small>This helps us customize your card features.</small>
            </div>

            <div className="form-group">
              <label htmlFor="card_pic">Profile Picture</label>
              <input type="file" id="card_pic" name="card_pic" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>
        )

      case CreationStage.Appearance:
        return (
          <div className="wizard-stage">
            <h2>Appearance</h2>
            <p className="stage-description">Customize how your digital card looks.</p>

            <div className="form-group">
              <label htmlFor="display_address">Address</label>
              <input
                type="text"
                id="display_address"
                name="display_address"
                value={formData.display_address}
                onChange={handleChange}
                placeholder="e.g. 123 Main St, City, Country"
              />
            </div>

            <div className="color-pickers">
              <div className="form-group">
                <label htmlFor="theme_color_1">Primary Color</label>
                <input
                  type="color"
                  id="theme_color_1"
                  name="theme_color_1"
                  value={formData.theme_color_1}
                  onChange={handleChange}
                />
                <small>Main background color</small>
              </div>

              <div className="form-group">
                <label htmlFor="theme_color_2">Secondary Color</label>
                <input
                  type="color"
                  id="theme_color_2"
                  name="theme_color_2"
                  value={formData.theme_color_2}
                  onChange={handleChange}
                />
                <small>Button and accent color</small>
              </div>

              <div className="form-group">
                <label htmlFor="theme_color_3">Text Color</label>
                <input
                  type="color"
                  id="theme_color_3"
                  name="theme_color_3"
                  value={formData.theme_color_3}
                  onChange={handleChange}
                />
                <small>Text and icon color</small>
              </div>
            </div>

            <div className="form-group">
              <label>Extra Photos (Gallery)</label>
              <input type="file" accept="image/*" onChange={handleExtraPhotoUpload} />
              <small>Add photos to your card gallery</small>
            </div>

            {formData.extra_photos.length > 0 && (
              <div className="extra-photos-preview">
                <h4>Gallery Photos</h4>
                <div className="photo-grid">
                  {formData.extra_photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={photo || "/placeholder.svg"} alt={`Gallery item ${index + 1}`} />
                      <button type="button" className="remove-photo" onClick={() => removeExtraPhoto(index)}>
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case CreationStage.SocialMedia:
        return (
          <div className="wizard-stage">
            <h2>Social Media</h2>
            <p className="stage-description">Add your social media profiles to your digital card.</p>

            {formData.social_medias.map((social, index) => (
              <div key={index} className="social-media-item">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`social-platform-${index}`}>Platform</label>
                    <select
                      id={`social-platform-${index}`}
                      value={social.platform}
                      onChange={(e) => handleSocialMediaChange(index, "platform", e.target.value)}
                    >
                      <option value="">Select platform...</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Twitter">Twitter</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="YouTube">YouTube</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Pinterest">Pinterest</option>
                      <option value="Snapchat">Snapchat</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`social-url-${index}`}>URL</label>
                    <input
                      type="url"
                      id={`social-url-${index}`}
                      value={social.url}
                      onChange={(e) => handleSocialMediaChange(index, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <button type="button" className="remove-button" onClick={() => removeSocialMedia(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="add-button" onClick={addSocialMedia}>
              Add Social Media
            </button>
          </div>
        )

      case CreationStage.ActionButtons:
        return (
          <div className="wizard-stage">
            <h2>Action Buttons</h2>
            <p className="stage-description">Add buttons that visitors can click on your digital card.</p>

            {formData.action_buttons.map((button, index) => (
              <div key={index} className="action-button-item">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`button-label-${index}`}>Button Label</label>
                    <input
                      type="text"
                      id={`button-label-${index}`}
                      value={button.label}
                      onChange={(e) => handleActionButtonChange(index, "label", e.target.value)}
                      placeholder="e.g. Visit My Website"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`button-url-${index}`}>URL</label>
                    <input
                      type="url"
                      id={`button-url-${index}`}
                      value={button.url}
                      onChange={(e) => handleActionButtonChange(index, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <button type="button" className="remove-button" onClick={() => removeActionButton(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="add-button" onClick={addActionButton}>
              Add Action Button
            </button>

            <h3 className="section-title">Floating Action Buttons</h3>
            <p className="section-description">These buttons will appear at the bottom of your card.</p>

            {formData.floating_actions.map((action, index) => (
              <div key={index} className="floating-action-item">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`action-type-${index}`}>Action Type</label>
                    <select
                      id={`action-type-${index}`}
                      value={action.type}
                      onChange={(e) => handleFloatingActionChange(index, "type", e.target.value)}
                    >
                      <option value="">Select type...</option>
                      <option value="Whatsapp">WhatsApp</option>
                      <option value="Call">Call</option>
                      <option value="SMS">SMS</option>
                      <option value="Email">Email</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`action-url-${index}`}>URL/Number/Email</label>
                    <input
                      type="text"
                      id={`action-url-${index}`}
                      value={action.url}
                      onChange={(e) => handleFloatingActionChange(index, "url", e.target.value)}
                      placeholder="e.g. +1234567890 or email@example.com"
                    />
                  </div>

                  <button type="button" className="remove-button" onClick={() => removeFloatingAction(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="add-button" onClick={addFloatingAction}>
              Add Floating Action
            </button>
          </div>
        )

      case CreationStage.SpecialFeatures:
        return (
          <div className="wizard-stage">
            <h2>Special Features</h2>
            <p className="stage-description">Add special features to your digital card.</p>

            {/* Location section */}
            <div className="feature-section">
              <h3>Location</h3>
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude || ""}
                  onChange={handleChange}
                  placeholder="e.g. 40.7128"
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude || ""}
                  onChange={handleChange}
                  placeholder="e.g. -74.0060"
                />
              </div>

              <div className="form-group">
                <label htmlFor="custom_map_link">Custom Map Link (optional)</label>
                <input
                  type="url"
                  id="custom_map_link"
                  name="custom_map_link"
                  value={formData.custom_map_link || ""}
                  onChange={handleChange}
                  placeholder="e.g. https://goo.gl/maps/..."
                />
                <small>If provided, this link will be used instead of the coordinates.</small>
              </div>
            </div>

            {/* WiFi section - only shown for certain business types */}
            {formData.is_wifi_allowed && (
              <div className="feature-section">
                <h3>WiFi Details</h3>
                <p>Add WiFi details for your customers to easily connect.</p>

                <div className="form-group">
                  <label htmlFor="card_wifi_ssid">WiFi Network Name (SSID)</label>
                  <input
                    type="text"
                    id="card_wifi_ssid"
                    name="card_wifi_ssid"
                    value={formData.card_wifi_ssid || ""}
                    onChange={handleChange}
                    placeholder="e.g. MyBusinessWiFi"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="card_wifi_password">WiFi Password</label>
                  <input
                    type="text"
                    id="card_wifi_password"
                    name="card_wifi_password"
                    value={formData.card_wifi_password || ""}
                    onChange={handleChange}
                    placeholder="WiFi password"
                  />
                  <small>Leave blank if your WiFi doesn't have a password.</small>
                </div>
              </div>
            )}
          </div>
        )

      case CreationStage.Review:
        return (
          <div className="wizard-stage">
            <h2>Review Your Card</h2>
            <p className="stage-description">Review your digital card before creating it.</p>

            <div className="review-summary">
              <h3>Basic Information</h3>
              <ul>
                <li>
                  <strong>Username:</strong> {formData.card_username}
                </li>
                <li>
                  <strong>Display Name:</strong> {formData.display_name}
                </li>
                <li>
                  <strong>Email:</strong> {formData.card_email || "Not provided"}
                </li>
                <li>
                  <strong>Bio:</strong> {formData.bio || "Not provided"}
                </li>
                <li>
                  <strong>Business Type:</strong>{" "}
                  {formData.business_type
                    ? businessTypes.find((t) => t.value === formData.business_type)?.label
                    : "Not specified"}
                </li>
              </ul>

              <h3>Social Media</h3>
              {formData.social_medias.length > 0 ? (
                <ul>
                  {formData.social_medias.map((social, index) => (
                    <li key={index}>
                      <strong>{social.platform}:</strong> {social.url}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No social media profiles added.</p>
              )}

              <h3>Action Buttons</h3>
              {formData.action_buttons.length > 0 ? (
                <ul>
                  {formData.action_buttons.map((button, index) => (
                    <li key={index}>
                      <strong>{button.label}:</strong> {button.url}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No action buttons added.</p>
              )}

              <h3>Floating Actions</h3>
              {formData.floating_actions.length > 0 ? (
                <ul>
                  {formData.floating_actions.map((action, index) => (
                    <li key={index}>
                      <strong>{action.type}:</strong> {action.url}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No floating actions added.</p>
              )}

              {formData.is_wifi_allowed && (
                <>
                  <h3>WiFi Details</h3>
                  <ul>
                    <li>
                      <strong>SSID:</strong> {formData.card_wifi_ssid || "Not provided"}
                    </li>
                    <li>
                      <strong>Password:</strong> {formData.card_wifi_password ? "●●●●●●●●" : "Not provided"}
                    </li>
                  </ul>
                </>
              )}

              {(formData.latitude || formData.longitude) && (
                <>
                  <h3>Location</h3>
                  <ul>
                    <li>
                      <strong>Latitude:</strong> {formData.latitude}
                    </li>
                    <li>
                      <strong>Longitude:</strong> {formData.longitude}
                    </li>
                    {formData.custom_map_link && (
                      <li>
                        <strong>Custom Map Link:</strong> {formData.custom_map_link}
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="create-card-wizard">
      <div className="wizard-header">
        <h1>Create Your Digital Card</h1>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentStage / (Object.keys(CreationStage).length / 2 - 1)) * 100}%` }}
            ></div>
          </div>

          {/* Step indicators */}
          <div className="progress-steps">
            {Array.from({ length: Object.keys(CreationStage).length / 2 }, (_, i) => (
              <div
                key={i}
                className={`progress-step ${currentStage >= i ? "active" : ""}`}
                onClick={() => jumpToStage(i as CreationStage)}
              >
                <div className="step-number">{i + 1}</div>
                <div className="step-label">{getStageName(i as CreationStage)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wizard-container">
        <div className="wizard-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {renderStage()}

          <div className="wizard-navigation">
            {currentStage > 0 && (
              <button type="button" className="prev-button" onClick={prevStage} disabled={loading}>
                Previous
              </button>
            )}

            {currentStage < CreationStage.Review ? (
              <button type="button" className="next-button" onClick={nextStage} disabled={loading}>
                Next
              </button>
            ) : (
              <button type="button" className="submit-button" onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating..." : "Create Card"}
              </button>
            )}
          </div>
        </div>

        <div className="card-preview-column">
          <h3>Card Preview</h3>
          <CardPreview card={formData as unknown as Partial<Card>} />
        </div>
      </div>
    </div>
  )
}

export default CreateCardWizard

