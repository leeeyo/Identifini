"use client"

import React, { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMenu } from "../../context/MenuContext"
import CardService from "../../services/CardService"

// Add this helper function at the top of your file
const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A"
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

const MenuDetail: React.FC = () => {
  const { username, menuId } = useParams<{ username: string; menuId: string }>()
  const { currentMenu, loading, error, fetchMenu } = useMenu()
  const navigate = useNavigate()
  const [cardId, setCardId] = React.useState<string | null>(null)

  useEffect(() => {
    const getCardId = async () => {
      if (!username) return

      try {
        const card = await CardService.getCardByUsername(username)
        if (card && (card._id || card.id)) {
          const id = (card._id || card.id) as string
          setCardId(id)

          if (id && menuId) {
            fetchMenu(id, menuId)
          }
        }
      } catch (err) {
        console.error("Error fetching card:", err)
      }
    }

    getCardId()
  }, [username, menuId, fetchMenu])

  const handleBack = () => {
    navigate(`/cards/${username}/menus`)
  }

  const handleEdit = () => {
    navigate(`/cards/${username}/menus/${menuId}/edit`)
  }

  const handleAddItem = () => {
    navigate(`/cards/${username}/menus/${menuId}/items/create`)
  }

  const handleBackToDashboard = () => {
    navigate("/")
  }

  if (loading && !currentMenu) {
    return (
      <div className="container mx-auto p-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-4"></div>
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div
          className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  if (!currentMenu) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-10">
          <p className="text-muted-foreground">Menu not found</p>
          <button
            onClick={handleBack}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Back to Menus
          </button>
        </div>
      </div>
    )
  }

  // Ensure items is always an array
  const items = currentMenu.items || []

  return (
    <div className="container max-w-6xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBackToDashboard}
          className="text-muted-foreground hover:text-card-foreground flex items-center"
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
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-3 py-1 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Menu
          </button>
          <button
            onClick={handleAddItem}
            className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      <div className="bg-card p-8 rounded-lg shadow-sm mb-8 border border-border">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-card-foreground mb-3">{currentMenu.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{currentMenu.description || "No description"}</p>
        </div>

        <div className="flex items-center justify-center mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium mr-3 ${
              currentMenu.isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {currentMenu.isActive ? "Active" : "Inactive"}
          </span>
          <span className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-muted/20 rounded-lg mb-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">Display Order</p>
            <p className="text-card-foreground font-medium text-lg">{currentMenu.displayOrder}</p>
            <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">Created</p>
            <p className="text-card-foreground font-medium text-lg">{formatDate(currentMenu.createdAt)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">Last Updated</p>
            <p className="text-card-foreground font-medium text-lg">{formatDate(currentMenu.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-card-foreground">Menu Items</h2>
          <button
            onClick={handleAddItem}
            className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg shadow-sm border border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <p className="text-muted-foreground mb-4">No items in this menu yet.</p>
            <button
              onClick={handleAddItem}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border table-fixed">
              <thead className="bg-muted/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[50%]"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[15%]"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[15%]"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[10%]"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-[10%]"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.image && (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-12 w-12 rounded-md object-cover mr-4"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                              e.currentTarget.alt = "Image not available"
                            }}
                          />
                        )}
                        <div className="flex flex-col items-start">
                          <div className="font-medium text-card-foreground text-base">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-card-foreground font-medium">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(item.price)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {item.category ? (
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {item.category}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          item.isAvailable
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => navigate(`/cards/${username}/menus/${menuId}/items/${item._id}/edit`)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium text-sm flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this item?")) {
                              if (cardId && menuId) {
                                if (item._id) {
                                  CardService.deleteMenuItem(cardId, menuId, item._id).then(() => {
                                    // Refresh the menu
                                    fetchMenu(cardId, menuId)
                                  })
                                } else {
                                  console.error("Cannot delete item: missing item ID")
                                }
                              }
                            }
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium text-sm flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MenuDetail

