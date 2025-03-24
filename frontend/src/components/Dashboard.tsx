"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import "./Dashboard.css"

interface Card {
  _id?: string // MongoDB uses _id
  id?: string // Support both _id and id
  card_username: string
  display_name?: string
  bio?: string
  card_pic?: string
  created_at: string
  // Add other fields as needed
}

const Dashboard: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)

        const response = await fetch("/api/cards")
        console.log("Response status:", response.status)

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        console.log("API Response:", data)

        // Check if response.data is an array or has a cards property
        if (Array.isArray(data)) {
          setCards(data)
        } else if (data && data.cards) {
          setCards(data.cards)
        } else if (data && Array.isArray(data.cards)) {
          // This is the format your backend is actually returning
          setCards(data.cards)
        } else {
          console.error("Unexpected response format:", data)

          // Fallback to mock data if API response format is unexpected
          const mockCards = [
            {
              id: "mock-1",
              card_username: "johndoe",
              display_name: "John Doe (Mock)",
              bio: "This is mock data because the API response couldn't be processed",
              created_at: new Date().toISOString(),
            },
            {
              id: "mock-2",
              card_username: "janedoe",
              display_name: "Jane Doe (Mock)",
              bio: "This is mock data because the API response couldn't be processed",
              created_at: new Date().toISOString(),
            },
          ]
          setCards(mockCards)
          setError("Using mock data - API response format was unexpected")
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching cards:", err)

        // Fallback to mock data if API call fails
        const mockCards = [
          {
            id: "mock-1",
            card_username: "johndoe",
            display_name: "John Doe (Mock)",
            bio: "This is mock data because the API call failed",
            created_at: new Date().toISOString(),
          },
          {
            id: "mock-2",
            card_username: "janedoe",
            display_name: "Jane Doe (Mock)",
            bio: "This is mock data because the API call failed",
            created_at: new Date().toISOString(),
          },
        ]
        setCards(mockCards)
        setError("Using mock data - Failed to load cards from API")
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  const handleDeleteCard = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this card?")) {
      return
    }

    try {
      await axios.delete(`/api/cards/${id}`)
      // Remove the deleted card from state
      setCards(
        cards.filter((card) => {
          const cardId = card._id || card.id
          return cardId !== id
        }),
      )
    } catch (err) {
      console.error("Error deleting card:", err)
      alert("Failed to delete card. Please try again.")
    }
  }

  const handleDuplicateCard = async (id: string) => {
    if (!window.confirm("Are you sure you want to duplicate this card?")) {
      return
    }

    try {
      const response = await axios.post(`/api/cards/${id}/duplicate`)
      // Add the new card to the state
      setCards([...cards, response.data])
    } catch (err) {
      console.error("Error duplicating card:", err)
      alert("Failed to duplicate card. Please try again.")
    }
  }

  if (loading) {
    return <div>Loading cards...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="card-grid">
        {cards.map((card) => (
          <div key={card._id || card.id} className="card-item">
            <div className="card-header">
              <h3>{card.card_username}</h3>
            </div>
            <div className="card-body">
              {card.card_pic && <img src={card.card_pic || "/placeholder.svg"} alt="Card" className="card-image" />}
              <p className="card-date">Created: {new Date(card.created_at).toLocaleDateString()}</p>
            </div>
            <div className="card-actions">
              <Link to={`/view-card/${card.card_username}`} className="card-button">
                View
              </Link>
              <Link to={`/edit-card/${card.card_username}`} className="card-button">
                Edit
              </Link>
              <button
                className="card-button delete"
                onClick={() => {
                  const cardId = card._id || card.id
                  if (cardId) {
                    handleDeleteCard(cardId)
                  } else {
                    alert("Cannot delete card: Missing ID")
                  }
                }}
              >
                Delete
              </button>
              <button
                className="card-button"
                onClick={() => {
                  const cardId = card._id || card.id
                  if (cardId) {
                    handleDuplicateCard(cardId)
                  } else {
                    alert("Cannot duplicate card: Missing ID")
                  }
                }}
              >
                Duplicate
              </button>
            </div>
          </div>
        ))}
      </div>
      <Link to="/create-card" className="create-button">
        Create New Card
      </Link>
    </div>
  )
}

export default Dashboard

