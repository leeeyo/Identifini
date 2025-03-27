"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import CardService from "../services/CardService"
import type { Card } from "../types/card"
import { useAuth } from "../context/AuthContext"

const Dashboard: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const cardsPerPage = 6
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

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

      const response = await CardService.getAllCards(page, cardsPerPage)

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
      } catch (err) {
        console.error("Error duplicating card:", err)
        alert("Failed to duplicate card. Please try again.")
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleManageMenus = (username: string) => {
    navigate(`/cards/${username}/menus`)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold text-card-foreground mb-4">Welcome to Identifini</h1>
          <p className="text-muted-foreground mb-6">Please log in to view your dashboard and manage your cards.</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Dashboard Header and Content with mobile optimization */}
      <div className="mobile-dashboard-layout">
        {/* Dashboard Header - will be moved to right/bottom on mobile */}
        <div className="mobile-dashboard-header flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="font-medium text-primary">{user?.name || user?.username}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {stats.cardCount < stats.maxCards && (
              <Link
                to="/create-card"
                className="inline-flex items-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200 shadow-sm hover:shadow-md w-full md:w-auto justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Card
              </Link>
            )}
            {cards.length > 0 && (
              <Link
                to={`/cards/${cards[0].card_username}/menus/create`}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md w-full md:w-auto justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Menu
              </Link>
            )}
          </div>
        </div>

        {/* Dashboard Content - will be moved to left/top on mobile */}
        <div className="mobile-dashboard-content">
          {/* Stats Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Your Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cards Created */}
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-card-foreground">Cards Created</h3>
                  <span className="text-primary font-semibold text-lg">
                    {stats.cardCount}/{stats.maxCards}
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2.5 mb-4 overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(stats.cardCount / stats.maxCards) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">{stats.maxCards - stats.cardCount} cards remaining</p>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {Math.round((stats.cardCount / stats.maxCards) * 100)}% Used
                  </span>
                </div>
              </div>

              {/* Client Accounts */}
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-card-foreground">Client Accounts</h3>
                  <span className="text-primary font-semibold text-lg">
                    {stats.clientCount}/{stats.maxClients}
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2.5 mb-4 overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(stats.clientCount / stats.maxClients) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {stats.maxClients - stats.clientCount} clients remaining
                  </p>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {Math.round((stats.clientCount / stats.maxClients) * 100)}% Used
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-card-foreground">Your Cards</h2>

              {stats.cardCount < stats.maxCards && (
                <Link
                  to="/create-card"
                  className="text-sm text-primary hover:text-primary/90 font-medium flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Card
                </Link>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin mb-4"></div>
                <p className="text-muted-foreground font-medium">Loading your cards...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-error p-4 rounded-md mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-error"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-error">{error}</p>
                    <button
                      onClick={() => fetchCards(currentPage)}
                      className="mt-2 text-sm font-medium text-error hover:text-error/90 focus:outline-none"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {cards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {cards.map((card) => (
                      <div
                        key={card._id || card.id}
                        className="bg-card rounded-lg overflow-hidden shadow-sm border border-border transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
                      >
                        <div className="bg-primary p-4 text-primary-foreground">
                          <h3 className="text-base font-medium truncate">@{card.card_username}</h3>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center mb-4">
                            {card.card_pic ? (
                              <img
                                src={card.card_pic || "/placeholder.svg"}
                                alt={card.display_name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-card shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg shadow-sm">
                                {card.display_name ? card.display_name.charAt(0).toUpperCase() : "?"}
                              </div>
                            )}
                            <div className="ml-3">
                              <h4 className="font-semibold text-card-foreground">{card.display_name}</h4>
                              <p className="text-xs text-muted-foreground">
                                Created {new Date(card.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {card.bio && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{card.bio}</p>}

                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                            <Link
                              to={`/view-card/${card.card_username}`}
                              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                            >
                              View
                            </Link>

                            <Link
                              to={`/edit-card/${card.card_username}`}
                              className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                            >
                              Edit
                            </Link>

                            <button
                              onClick={() => handleDeleteCard(card._id || card.id || "")}
                              className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-error rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                              Delete
                            </button>

                            {stats.cardCount < stats.maxCards && (
                              <button
                                onClick={() => handleDuplicateCard(card._id || card.id || "")}
                                className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-success rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
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

                            {/* Menu Management Button */}
                            <Link
                              to={`/cards/${card.card_username}/menus`}
                              className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              Menus
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-8 text-center shadow-sm">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">No cards available</h3>
                    <p className="text-muted-foreground mb-6">You haven't created any cards yet.</p>
                    {stats.cardCount < stats.maxCards && (
                      <Link
                        to="/create-card"
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors duration-200 shadow-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Create Your First Card
                      </Link>
                    )}
                  </div>
                )}

                {/* Pagination - Simplified for mobile */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-border bg-card text-sm font-medium ${
                          currentPage === 1
                            ? "text-muted-foreground cursor-not-allowed"
                            : "text-card-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Show fewer page numbers on mobile */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // On mobile, show only current page and adjacent pages
                          if (window.innerWidth < 640) {
                            return (
                              page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
                            )
                          }
                          return true
                        })
                        .map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? "z-10 bg-primary/10 border-primary text-primary"
                                : "bg-card border-border text-card-foreground hover:bg-muted"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-border bg-card text-sm font-medium ${
                          currentPage === totalPages
                            ? "text-muted-foreground cursor-not-allowed"
                            : "text-card-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

