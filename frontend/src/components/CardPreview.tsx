import type React from "react"
import type { Card } from "../types/card"

interface CardPreviewProps {
  card: Partial<Card>
}

const CardPreview: React.FC<CardPreviewProps> = ({ card }) => {
  return (
    <div className="card-preview-container">
      <div className="overflow-hidden rounded-xl shadow-lg dark:shadow-md">
        {/* Card Header */}
        <div
          className="p-6 text-center"
          style={{
            backgroundColor: card.theme_color_1 || "#4a90e2",
            color: "#ffffff",
          }}
        >
          {card.card_pic ? (
            <img
              src={card.card_pic || "/placeholder.svg"}
              alt={card.display_name}
              className="w-24 h-24 rounded-full object-cover border-2 border-white mx-auto mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {card.display_name ? card.display_name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <h2 className="text-xl font-bold">{card.display_name || "Display Name"}</h2>
        </div>

        {/* Card Content */}
        <div
          className="p-5"
          style={{
            backgroundColor: card.theme_color_2 || "#ffffff",
            color: card.theme_color_3 || "#333333",
          }}
        >
          {card.bio && <p className="text-sm italic mb-4">{card.bio}</p>}

          {card.card_email && (
            <div className="mb-2">
              <strong>Email:</strong> {card.card_email}
            </div>
          )}

          {card.display_address && (
            <div className="mb-2">
              <strong>Address:</strong> {card.display_address}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div
          className="p-3 text-center text-sm border-t"
          style={{
            backgroundColor: card.theme_color_2 || "#ffffff",
            color: card.theme_color_3 || "#333333",
            borderColor: "rgba(0,0,0,0.1)",
          }}
        >
          <p>@{card.card_username || "username"}</p>
        </div>
      </div>
    </div>
  )
}

export default CardPreview

