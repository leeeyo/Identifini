"use client"

import type React from "react"
import { Link } from "react-router-dom"
import type { Card } from "../types/card"

// Helper function for safe date formatting
const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A"
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

interface CardItemProps {
  card: Card
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  canDuplicate: boolean
}

const CardItem: React.FC<CardItemProps> = ({ card, onDelete, onDuplicate, canDuplicate }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
      <div className="bg-primary-600 dark:bg-primary-700 p-4 text-white">
        <h3 className="text-base font-medium truncate">@{card.card_username}</h3>
      </div>
      <div className="p-5">
        <div className="flex items-center mb-4">
          {card.card_pic ? (
            <img
              src={card.card_pic || "/placeholder.svg"}
              alt={card.display_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
              onError={(e) => {
                // If image fails to load, replace with initial
                e.currentTarget.style.display = "none"
                // Cast nextElementSibling to HTMLElement to access style property
                const sibling = e.currentTarget.nextElementSibling as HTMLElement
                if (sibling) {
                  sibling.style.display = "flex"
                }
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 font-semibold text-lg shadow-sm">
              {card.display_name ? card.display_name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <div className="ml-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{card.display_name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Created {formatDate(card.created_at)}</p>
          </div>
        </div>

        {card.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{card.bio}</p>}

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            to={`/view-card/${card.card_username}`}
            className="text-xs px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 rounded hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            View
          </Link>

          <Link
            to={`/edit-card/${card.card_username}`}
            className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Edit
          </Link>

          <button
            onClick={() => onDelete(card._id || card.id || "")}
            className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Delete
          </button>

          {canDuplicate && (
            <button
              onClick={() => onDuplicate(card._id || card.id || "")}
              className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              Duplicate
            </button>
          )}

          <Link
            to={`/view-leads/${card.card_username}`}
            className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            Leads
          </Link>

          {/* Add menu management link */}
          <Link
            to={`/cards/${card.card_username}/menus`}
            className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            Menus
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CardItem

