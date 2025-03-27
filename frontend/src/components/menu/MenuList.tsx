"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMenu } from "../../context/MenuContext"
import { useAuth } from "../../context/AuthContext"
import CardService from "../../services/CardService"

const MenuList: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const { menus = [], loading, error, fetchMenus } = useMenu()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cardId, setCardId] = useState<string | null>(null)
  const [cardFetched, setCardFetched] = useState(false)
  const [localLoading, setLocalLoading] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

  // Use useCallback to prevent recreating this function on every render
  const getCardId = useCallback(async () => {
    if (!username || cardFetched) return

    try {
      console.log("Fetching card for username:", username)
      setLocalLoading(true)
      const card = await CardService.getCardByUsername(username)

      if (card && (card._id || card.id)) {
        const id = (card._id || card.id) as string
        setCardId(id)
        console.log("Card ID found:", id)
        await fetchMenus(id)
      } else {
        setLocalError("Card not found")
      }
    } catch (err) {
      console.error("Error fetching card:", err)
      setLocalError("Failed to fetch card information")
    } finally {
      setCardFetched(true)
      setLocalLoading(false)
    }
  }, [username, fetchMenus, cardFetched])

  useEffect(() => {
    getCardId()
  }, [getCardId])

  const handleCreateMenu = () => {
    navigate(`/cards/${username}/menus/create`)
  }

  const handleEditMenu = (menuId: string) => {
    navigate(`/cards/${username}/menus/${menuId}/edit`)
  }

  const handleViewMenu = (menuId: string) => {
    navigate(`/cards/${username}/menus/${menuId}`)
  }

  const handleDeleteMenu = async (menuId: string) => {
    if (window.confirm("Are you sure you want to delete this menu?")) {
      if (cardId) {
        try {
          await CardService.deleteMenu(cardId, menuId)
          // Refresh menus after deletion
          fetchMenus(cardId)
        } catch (err) {
          console.error("Error deleting menu:", err)
          alert("Failed to delete menu. Please try again.")
        }
      }
    }
  }

  const handleRefresh = async () => {
    if (cardId) {
      try {
        setLocalLoading(true)
        await fetchMenus(cardId)
      } catch (err) {
        console.error("Error refreshing menus:", err)
      } finally {
        setLocalLoading(false)
      }
    }
  }

  const handleBackToDashboard = () => {
    navigate("/")
  }

  // Menu card colors for visual variety
  const cardColors = [
    {
      bg: "from-blue-500/10 to-blue-600/5",
      accent: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      icon: "clipboard-list",
    },
    {
      bg: "from-green-500/10 to-green-600/5",
      accent: "bg-green-500",
      text: "text-green-600 dark:text-green-400",
      icon: "clipboard",
    },
    {
      bg: "from-purple-500/10 to-purple-600/5",
      accent: "bg-purple-500",
      text: "text-purple-600 dark:text-purple-400",
      icon: "home",
    },
    {
      bg: "from-amber-500/10 to-amber-600/5",
      accent: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      icon: "grid",
    },
    {
      bg: "from-pink-500/10 to-pink-600/5",
      accent: "bg-pink-500",
      text: "text-pink-600 dark:text-pink-400",
      icon: "utensils",
    },
  ]

  if (localLoading || loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-card-foreground">Menus</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={`loading-${i}`} className="h-64 w-full bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (localError || error) {
    return (
      <div className="container mx-auto p-4">
        <div
          className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {localError || error}</span>
          <button
            onClick={() => {
              setCardFetched(false)
              setLocalError(null)
              getCardId()
            }}
            className="mt-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center mb-2">
            <button
              onClick={handleBackToDashboard}
              className="text-muted-foreground hover:text-card-foreground mr-3 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-card-foreground">Your Menus</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your digital menus</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="bg-muted text-muted-foreground p-2 rounded-full hover:bg-muted/80 transition-colors"
            aria-label="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={handleCreateMenu}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Menu
          </button>
        </div>
      </div>

      {!menus || menus.length === 0 ? (
        <div className="bg-card rounded-lg shadow-md border border-border p-8 text-center">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-card-foreground mb-2">No menus available</h3>
          <p className="text-muted-foreground mb-6">Create your first menu to showcase your offerings to customers.</p>
          <button
            onClick={handleCreateMenu}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Your First Menu
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu, index) => {
              const colorIndex = index % cardColors.length
              return (
                <div
                  key={menu._id || `menu-${Math.random()}`}
                  className={`bg-gradient-to-br ${cardColors[colorIndex].bg} border border-border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-md ${cardColors[colorIndex].accent} bg-opacity-20`}>
                        <div className={cardColors[colorIndex].text}>
                          {cardColors[colorIndex].icon === "clipboard-list" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6m-6 4h6"
                              />
                            </svg>
                          )}
                          {cardColors[colorIndex].icon === "clipboard" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          )}
                          {cardColors[colorIndex].icon === "home" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                            </svg>
                          )}
                          {cardColors[colorIndex].icon === "grid" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          )}
                          {cardColors[colorIndex].icon === "utensils" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          menu.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {menu.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-card-foreground mb-2">{menu.title}</h2>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {menu.description || "No description provided"}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        {menu.items?.length || 0} items
                      </div>
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                        Order: {menu.displayOrder}
                      </div>
                    </div>

                    <div className="flex justify-between space-x-2 pt-4 border-t border-border h-10">
                      <button
                        onClick={() => handleViewMenu(menu._id)}
                        className="flex-1 text-center py-2 rounded-md bg-card text-card-foreground hover:bg-muted transition-colors text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditMenu(menu._id)}
                        className={`flex-1 text-center py-2 rounded-md ${cardColors[colorIndex].text} bg-card hover:bg-muted transition-colors text-sm font-medium`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(menu._id)}
                        className="flex-1 text-center py-2 rounded-md bg-card text-red-600 dark:text-red-400 hover:bg-muted transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add Menu Card */}
            <div
              onClick={handleCreateMenu}
              className="border-2 border-dashed border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Create New Menu</h3>
                <p className="text-muted-foreground">Add another menu to showcase more of your offerings</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Menu Tips</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Create multiple menus for different times of day (breakfast, lunch, dinner)</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Use categories to organize your menu items for easier navigation</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Add detailed descriptions to entice customers and highlight special ingredients</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default MenuList

