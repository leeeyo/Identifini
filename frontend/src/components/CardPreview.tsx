import type React from "react"
import type { Card } from "../types/card"
import "./CardPreview.css"

interface CardPreviewProps {
  card: Partial<Card>
}

const CardPreview: React.FC<CardPreviewProps> = ({ card }) => {
  return (
    <div
      className="card-preview-container"
      style={
        {
          "--primary-color": card.theme_color_1 || "#4a90e2",
          "--secondary-color": card.theme_color_2 || "#ffffff",
          "--text-color": card.theme_color_3 || "#333333",
        } as React.CSSProperties
      }
    >
      <div className="preview-header">
        <h3>Card Preview</h3>
      </div>

      <div className="card-preview">
        <div className="card-preview-header">
          {card.card_pic ? (
            <img src={card.card_pic || "/placeholder.svg"} alt={card.display_name} className="card-profile-pic" />
          ) : (
            <div className="card-profile-pic-placeholder">
              {card.display_name ? card.display_name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <h2>{card.display_name || "Display Name"}</h2>
        </div>

        <div className="card-preview-content">
          {card.bio && <p className="card-bio">{card.bio}</p>}

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
        </div>

        <div className="card-preview-footer">
          <p>@{card.card_username || "username"}</p>
        </div>
      </div>
    </div>
  )
}

export default CardPreview

