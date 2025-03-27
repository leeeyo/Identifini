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
          className="p-8 text-center" // Increased padding for taller header
          style={{
            backgroundColor: card.theme_color_1 || "#4a90e2",
            color: "#ffffff",
          }}
        >
          {card.card_pic ? (
            <img
              src={card.card_pic || "/placeholder.svg"}
              alt={card.display_name}
              className="w-28 h-28 rounded-full object-cover border-2 border-white mx-auto mb-5" // Larger image and margin
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-white/30 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-5">
              {" "}
              {/* Larger avatar */}
              {card.display_name ? card.display_name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <h2 className="text-2xl font-bold">{card.display_name || "Display Name"}</h2>
        </div>

        {/* Card Content */}
        <div
          className="p-6" // Increased padding
          style={{
            backgroundColor: card.theme_color_2 || "#ffffff",
            color: card.theme_color_3 || "#333333",
          }}
        >
          {card.bio && <p className="text-sm italic mb-5">{card.bio}</p>} {/* Increased margin */}
          {card.card_email && (
            <div className="mb-3">
              {" "}
              {/* Increased margin */}
              <strong>Email:</strong> {card.card_email}
            </div>
          )}
          {card.display_address && (
            <div className="mb-3">
              {" "}
              {/* Increased margin */}
              <strong>Address:</strong> {card.display_address}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div
          className="p-4 text-center text-sm border-t" // Increased padding
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

