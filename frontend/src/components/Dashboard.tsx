"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./Dashboard.css"

interface Card {
  id: string
  card_username: string
  display_name?: string
  card_pic?: string
  created_at: string
}

const Dashboard: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/cards")
        // Fix: Access the cards array from the response data structure
        setCards(response.data.cards || [])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching cards:", err)
        setError("Failed to load cards. Please try again later.")
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
      setCards(cards.filter((card) => card.id !== id))
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
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/create-card" className="create-button">
          Create New Card
        </Link>
      </div>

      <div className="cards-grid">
        {cards.length > 0 ? (
          cards.map((card) => (
            <div key={card.id} className="card-item">
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
                <button className="card-button delete" onClick={() => handleDeleteCard(card.id)}>
                  Delete
                </button>
                <button className="card-button" onClick={() => handleDuplicateCard(card.id)}>
                  Duplicate
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-cards">
            <p>You haven't created any cards yet.</p>
            <Link to="/create-card" className="create-button">
              Create Your First Card
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

