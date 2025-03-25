"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import CardService from "../services/CardService"
import type { Card } from "../types/card"
import { useAuth } from "../context/AuthContext"
import "./Dashboard.css"

const Dashboard: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const cardsPerPage = 6
  const { isAuthenticated, user } = useAuth()

  // Stats
  const [stats, setStats] = useState({
    cardCount: 0,
    maxCards: 10, // Default value, should be fetched from user profile
    clientCount: 0,
    maxClients: 5, // Default value, should be fetched from user profile
  })

  const fetchCards = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      console.log("Trying to fetch cards from /api/cards")

      const response = await CardService.getAllCards()
      console.log("Cards response:", response)

      if (response && response.cards) {
        setCards(response.cards)
        setStats((prevStats) => ({
          ...prevStats,
          cardCount: response.total || response.cards.length,
        }))

        // Calculate total pages
        const total = response.total || response.cards.length
        setTotalPages(Math.ceil(total / cardsPerPage))
      } else {
        setError("Unexpected response format")
      }
    } catch (err) {
      console.error("Error fetching cards:", err)
      setError("Failed to load cards. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchCards(currentPage)
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, currentPage])

  const handleDeleteCard = async (id: string) => {
    if (!id) {
      alert("Cannot delete: Missing card ID")
      return
    }

    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        await CardService.deleteCard(id)
        // Remove the deleted card from state
        setCards(cards.filter((card) => (card._id || card.id) !== id))
        // Update stats
        setStats((prevStats) => ({
          ...prevStats,
          cardCount: prevStats.cardCount - 1,
        }))
      } catch (err) {
        console.error("Error deleting card:", err)
        alert("Failed to delete card. Please try again.")
      }
    }
  }

  const handleDuplicateCard = async (id: string) => {
    if (!id) {
      alert("Cannot duplicate: Missing card ID")
      return
    }

    if (window.confirm("Are you sure you want to duplicate this card?")) {
      try {
        const response = await CardService.duplicateCard(id)
        // Add the new card to the state
        setCards([...cards, response])
        // Update stats
        setStats((prevStats) => ({
          ...prevStats,
          cardCount: prevStats.cardCount + 1,
        }))
        alert("Card duplicated successfully!")
      } catch (err) {
        console.error("Error duplicating card:", err)
        alert("Failed to duplicate card. Please try again.")
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Calculate progress percentages
  const cardsProgress = stats.maxCards > 0 ? (stats.cardCount / stats.maxCards) * 100 : 0
  const clientsProgress = stats.maxClients > 0 ? (stats.clientCount / stats.maxClients) * 100 : 0

  if (!isAuthenticated) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p>Please log in to view your cards.</p>
        <Link to="/login" className="auth-button">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </h1>
          <p>Welcome back, {user?.name || user?.username}!</p>
        </div>
        <div className="dashboard-actions">
          {stats.cardCount < stats.maxCards && (
            <Link to="/create-card" className="create-button">
              <i className="fas fa-id-card"></i> Create Card
            </Link>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="section-header">
        <h2>
          <i className="fas fa-chart-line"></i> Your Analytics
        </h2>
      </div>

      <div className="stats-container">
        {/* Cards Created */}
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-id-card"></i>
          </div>
          <h3>{stats.cardCount}</h3>
          <p>Cards Created</p>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${cardsProgress}%` }}></div>
          </div>
          <p className="stat-details">
            {stats.cardCount} out of {stats.maxCards} cards
          </p>
        </div>

        {/* Client Accounts */}
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <h3>{stats.clientCount}</h3>
          <p>Client Accounts</p>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${clientsProgress}%` }}></div>
          </div>
          <p className="stat-details">
            {stats.clientCount} out of {stats.maxClients} clients
          </p>
        </div>
      </div>

      {/* Cards Section */}
      <div className="section-header">
        <h2>
          <i className="fas fa-id-card"></i> Your Cards
        </h2>
        {stats.cardCount < stats.maxCards && (
          <Link to="/create-card" className="create-button">
            Create New Card
          </Link>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cards...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchCards(currentPage)} className="retry-button">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {cards.length > 0 ? (
            <div className="card-grid">
              {cards.map((card) => (
                <div key={card._id || card.id} className="card-item">
                  <div className="card-header">
                    <h3>{card.card_username}</h3>
                  </div>
                  <div className="card-body">
                    {card.card_pic && (
                      <img src={card.card_pic || "/placeholder.svg"} alt="Card" className="card-image" />
                    )}
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
                    {stats.cardCount < stats.maxCards && (
                      <button className="card-button" onClick={() => handleDuplicateCard(card._id || card.id || "")}>
                        Duplicate
                      </button>
                    )}
                    <Link to={`/view-leads/${card.card_username}`} className="card-button">
                      Leads
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No cards available</h3>
              <p>You haven't created any cards yet.</p>
              {stats.cardCount < stats.maxCards && (
                <Link to="/create-card" className="create-button">
                  Create Card
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-button ${currentPage === page ? "active" : ""}`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard

