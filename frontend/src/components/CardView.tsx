"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import "./CardView.css"

interface Card {
  id: string
  card_username: string
  display_name: string
  bio?: string
  card_pic?: string
  card_email?: string
  display_address?: string
  theme_color_1?: string
  theme_color_2?: string
  theme_color_3?: string
  social_medias?: string
  action_buttons?: string
  created_at: string
}

const CardView: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await axios.get(`/api/cards/username/${username}`)
        setCard(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching card data:", err)
        setError("Failed to load card data. Please try again later.")
        setLoading(false)
      }
    }

    fetchCardData()
  }, [username])

  if (loading) {
    return <div className="loading">Loading card data...</div>
  }

  if (error || !card) {
    return (
      <div className="card-view-container">
        <div className="error-message">{error || "Card not found"}</div>
        <button className="back-button" onClick={() => navigate("/")}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  // Parse JSON strings if they exist
  const socialMedias = card.social_medias ? JSON.parse(card.social_medias) : []
  const actionButtons = card.action_buttons ? JSON.parse(card.action_buttons) : []

  return (
    <div className="card-view-container">
      <div className="card-view-header">
        <h1>Card Preview: {card.card_username}</h1>
        <div className="header-actions">
          <button className="edit-button" onClick={() => navigate(`/edit-card/${card.card_username}`)}>
            Edit Card
          </button>
          <button className="back-button" onClick={() => navigate("/")}>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div
        className="card-preview"
        style={
          {
            "--primary-color": card.theme_color_1 || "#4a90e2",
            "--secondary-color": card.theme_color_2 || "#ffffff",
            "--text-color": card.theme_color_3 || "#333333",
          } as React.CSSProperties
        }
      >
        <div className="card-header">
          {card.card_pic ? (
            <img src={card.card_pic || "/placeholder.svg"} alt={card.display_name} className="card-profile-pic" />
          ) : (
            <div className="card-profile-pic-placeholder">{card.display_name.charAt(0)}</div>
          )}
          <h2>{card.display_name}</h2>
        </div>

        {card.bio && (
          <div className="card-bio">
            <p>{card.bio}</p>
          </div>
        )}

        {card.display_address && (
          <div className="card-address">
            <h3>Address</h3>
            <p>{card.display_address}</p>
          </div>
        )}

        {card.card_email && (
          <div className="card-email">
            <h3>Email</h3>
            <p>{card.card_email}</p>
          </div>
        )}

        {socialMedias.length > 0 && (
          <div className="card-social">
            <h3>Social Media</h3>
            <div className="social-links">
              {socialMedias.map((social: any, index: number) => (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="social-link">
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {actionButtons.length > 0 && (
          <div className="card-actions">
            <h3>Actions</h3>
            <div className="action-buttons">
              {actionButtons.map((action: any, index: number) => (
                <a key={index} href={action.url} target="_blank" rel="noopener noreferrer" className="action-button">
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="card-footer">
          <p>Created: {new Date(card.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export default CardView

