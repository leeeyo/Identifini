"use client"

import type React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMenu } from "../../context/MenuContext"
import CardService from "../../services/CardService"
import type { MenuItem } from "../../types/card"

const MenuItemList: React.FC = () => {
  const { username, menuId } = useParams<{ username: string; menuId: string }>()
  const { currentMenu, fetchMenu } = useMenu()
  const navigate = useNavigate()

  if (!currentMenu) {
    return null
  }

  // Ensure items is always an array
  const items = currentMenu.items || []

  const handleAddItem = () => {
    if (username && menuId) {
      navigate(`/cards/${username}/menus/${menuId}/items/create`)
    }
  }

  const handleEditItem = (itemId: string) => {
    if (username && menuId) {
      navigate(`/cards/${username}/menus/${menuId}/items/${itemId}/edit`)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        // Get the card ID from the current menu
        const cardId = currentMenu.card
        if (typeof cardId === "string" && menuId) {
          await CardService.deleteMenuItem(cardId, menuId, itemId)
          // Refresh the menu to update the UI
          fetchMenu(cardId, menuId)
        } else {
          console.error("Missing cardId or menuId for delete operation")
        }
      } catch (error) {
        console.error("Error deleting menu item:", error)
        alert("Failed to delete menu item. Please try again.")
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border dark:border-border">
      <div className="flex justify-between items-center p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-card-foreground">Menu Items</h2>
        <button
          onClick={handleAddItem}
          className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
        >
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
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
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {items.map((item: MenuItem) => (
                <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image && (
                        <div className="h-12 w-12 mr-4 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">IMG</span>
                        </div>
                      )}
                      <div className="flex flex-col items-start">
                        <div className="font-medium text-card-foreground text-base">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground mt-1 max-w-md">{item.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-card-foreground font-medium">{formatPrice(item.price)}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {item.category ? (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{item.category}</span>
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
                        onClick={() => item._id && handleEditItem(item._id)}
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
                        onClick={() => item._id && handleDeleteItem(item._id)}
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
  )
}

export default MenuItemList

