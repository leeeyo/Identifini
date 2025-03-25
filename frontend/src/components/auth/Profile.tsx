"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./AuthForms.css"

const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await updateProfile(formData)
      setSuccess("Profile updated successfully")
    } catch (err: any) {
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
      <div className="auth-container">
        <div className="auth-form-container">
          <h1>Profile</h1>
          <p>Please login to view your profile.</p>
          <button onClick={() => navigate("/login")} className="auth-button">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Your Profile</h1>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <div className="profile-info">
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
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
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
        <div className="auth-actions">
          <button onClick={handleLogout} className="auth-button logout-button">
            Logout
          </button>
          <button onClick={() => navigate("/")} className="auth-button secondary-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile

