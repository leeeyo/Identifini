"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import CardService from "../services/CardService"
import type { Card } from "../types/card"
import "./CardView.css"

const CardView: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCardData = async () => {
      if (!username) return

      try {
        setLoading(true)
        const cardData = await CardService.getCardByUsername(username)
        setCard(cardData)
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
  const socialMedias = card.social_medias
    ? typeof card.social_medias === "string"
      ? JSON.parse(card.social_medias)
      : card.social_medias
    : []

  const actionButtons = card.action_buttons
    ? typeof card.action_buttons === "string"
      ? JSON.parse(card.action_buttons)
      : card.action_buttons
    : []

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
        <div className="card-preview-header">
          {card.card_pic && (
            <img src={card.card_pic || "/placeholder.svg"} alt={card.display_name} className="card-profile-pic" />
          )}
          <h2>{card.display_name}</h2>
          {card.bio && <p className="card-bio">{card.bio}</p>}
        </div>

        <div className="card-preview-content">
          {card.card_email && (
            <div className="card-info-item">
              <strong>Email:</strong> {card.card_email}
            </div>
          )}

          {card.display_address && (
            <div className="card-info-item">
              <strong>Address:</strong> {card.display_address}
            </div>
          )}

          {socialMedias.length > 0 && (
            <div className="card-social-media">
              <h3>Social Media</h3>
              <ul>
                {socialMedias.map((social: any, index: number) => (
                  <li key={index}>
                    <a href={social.url} target="_blank" rel="noopener noreferrer">
                      {social.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {actionButtons.length > 0 && (
            <div className="card-action-buttons">
              <h3>Actions</h3>
              <div className="action-buttons-container">
                {actionButtons.map((action: any, index: number) => (
                  <a key={index} href={action.url} target="_blank" rel="noopener noreferrer" className="action-button">
                    {action.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card-preview-footer">
          <p>Created: {new Date(card.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export default CardView

