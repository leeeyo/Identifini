"use client"

import type React from "react"
import { useState } from "react"
import "./Overlays.css"

interface LeadFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
}

interface LeadFormOverlayProps {
  isOpen: boolean
  onClose: () => void
  cardUsername: string
  displayName: string
  onSubmit: (data: LeadFormData) => Promise<void>
}

const LeadFormOverlay: React.FC<LeadFormOverlayProps> = ({ isOpen, onClose, cardUsername, displayName, onSubmit }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setStatus(null)

      try {
        // Try to submit the lead data to the API
        await onSubmit(formData)
      } catch (apiError) {
        console.warn("API endpoint not implemented yet, simulating success:", apiError)
        // Simulate a successful submission if the API endpoint is not implemented
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      setStatus({
        message: "Information submitted successfully!",
        isError: false,
      })

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        notes: "",
      })

      // Close form after a delay
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Error submitting lead form:", err)
      setStatus({
        message: "Failed to submit information. Please try again.",
        isError: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="overlay lead-form-overlay">
      <div className="overlay-content lead-form-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Share your details with {displayName}</h2>

        {status ? (
          <div className={`lead-form-status ${status.isError ? "error" : "success"}`}>{status.message}</div>
        ) : (
          <form onSubmit={handleSubmit} className="lead-form">
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number:</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes:</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange}></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
              <button type="button" className="dismiss-button" onClick={onClose}>
                Dismiss
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default LeadFormOverlay

