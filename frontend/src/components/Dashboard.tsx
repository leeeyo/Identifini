"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import CardService from "../services/CardService"
import type { Card } from "../types/card"
import "./Dashboard.css"

const Dashboard: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        console.log("Trying to fetch cards from /api/cards")

        // Try the regular endpoint first
        try {
          const response = await CardService.getAllCards()
          console.log("Cards response:", response)

          if (response && response.cards) {
            setCards(response.cards)
            setLoading(false)
            return
          }
        } catch (err) {
          console.error("Regular endpoint failed, trying test endpoint")
        }

        // If regular endpoint fails, try the test endpoint
        try {
          console.log("Trying to fetch cards from /api/cards-test")
          const testResponse = await fetch("http://localhost:8080/api/cards-test")
          const data = await testResponse.json()
          console.log("Test endpoint response:", data)

          if (data && data.cards) {
            setCards(data.cards)
            setLoading(false)
            return
          }
        } catch (testErr) {
          console.error("Test endpoint failed too")
        }

        // If both fail, show error and use sample data
        setError("Failed to load cards. Please try again.")

        // Add sample cards for testing UI
        setCards([
          {
            _id: "sample-1",
            card_username: "sample-user",
            display_name: "Sample User",
            bio: "This is a sample card for testing",
            created_at: new Date().toISOString(),
          },
          {
            _id: "sample-2",
            card_username: "another-user",
            display_name: "Another User",
            bio: "This is another sample card",
            created_at: new Date().toISOString(),
          },
        ])
      } catch (err) {
        console.error("Error in fetchCards:", err)
        setError("Failed to load cards. Please try again.")

        // Add sample cards for testing UI
        setCards([
          {
            _id: "sample-1",
            card_username: "sample-user",
            display_name: "Sample User",
            bio: "This is a sample card for testing",
            created_at: new Date().toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  const handleDeleteCard = (id: string) => {
    console.log("Delete card:", id)
    // We'll implement this later
    alert("Delete functionality will be implemented later")
  }

  console.log("Dashboard component rendering")

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {loading ? (
        <p>Loading cards...</p>
      ) : error ? (
        <div>
          <p style={{ color: "red" }}>{error}</p>
          <p>Showing sample data instead</p>
        </div>
      ) : (
        <>
          <p>Found {cards.length} cards</p>

          <div className="card-grid">
            {cards.map((card) => (
              <div key={card._id || card.id} className="card-item">
                <div className="card-header">
                  <h3>{card.display_name || card.card_username}</h3>
                </div>
                <div className="card-body">
                  {card.bio && <p>{card.bio}</p>}
                  <p className="card-date">Created: {new Date(card.created_at).toLocaleDateString()}</p>
                </div>
                <div className="card-actions">
                  <Link to={`/view-card/${card.card_username}`} className="card-button">
                    View
                  </Link>
                  <Link to={`/edit-card/${card.card_username}`} className="card-button">
                    Edit
                  </Link>
                  <button className="card-button delete" onClick={() => handleDeleteCard(card._id || card.id || "")}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: "20px" }}>
        <Link to="/create-card" className="create-button">
          Create New Card
        </Link>
        <Link to="/api-debug" style={{ marginLeft: "10px", color: "blue" }}>
          Debug API Connection
        </Link>
      </div>
    </div>
  )
}

export default Dashboard

