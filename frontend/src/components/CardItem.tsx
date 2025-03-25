"use client"

import type React from "react"
import { Link } from "react-router-dom"
import type { Card } from "../types/card"

interface CardItemProps {
  card: Card
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  canDuplicate: boolean
}

const CardItem: React.FC<CardItemProps> = ({ card, onDelete, onDuplicate, canDuplicate }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
      <div className="bg-blue-600 p-4 text-white">
        <h3 className="text-base font-medium truncate">@{card.card_username}</h3>
      </div>
      <div className="p-5">
        <div className="flex items-center mb-4">
          {card.card_pic ? (
            <img
              src={card.card_pic || "/placeholder.svg"}
              alt={card.display_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg shadow-sm">
              {card.display_name ? card.display_name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <div className="ml-3">
            <h4 className="font-semibold text-gray-800">{card.display_name}</h4>
            <p className="text-xs text-gray-500">Created {new Date(card.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {card.bio && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{card.bio}</p>}

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <Link
            to={`/view-card/${card.card_username}`}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            View
          </Link>

          <Link
            to={`/edit-card/${card.card_username}`}
            className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
          >
            Edit
          </Link>

          <button
            onClick={() => onDelete(card._id || card.id || "")}
            className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          >
            Delete
          </button>

          {canDuplicate && (
            <button
              onClick={() => onDuplicate(card._id || card.id || "")}
              className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
            >
              Duplicate
            </button>
          )}

          <Link
            to={`/view-leads/${card.card_username}`}
            className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
          >
            Leads
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CardItem

