"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMenu } from "../../context/MenuContext"
import CardService from "../../services/CardService"

interface MenuItemFormData {
  name: string
  description: string
  price: number
  image: string
  category: string
  isAvailable: boolean
}

const MenuItemForm: React.FC = () => {
  const { username, menuId, itemId } = useParams<{ username: string; menuId: string; itemId: string }>()
  const isEditing = Boolean(itemId)
  const navigate = useNavigate()
  const { currentMenu, loading, error, fetchMenu } = useMenu()
  const [cardId, setCardId] = useState<string | null>(null)

  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    isAvailable: true,
  })

  useEffect(() => {
    const getCardId = async () => {
      if (!username) return

      try {
        const card = await CardService.getCardByUsername(username)
        if (card && (card._id || card.id)) {
          const id = (card._id || card.id) as string
          setCardId(id)

          if (menuId) {
            fetchMenu(id, menuId)
          }
        }
      } catch (err) {
        console.error("Error fetching card:", err)
      }
    }

    getCardId()
  }, [username, menuId, fetchMenu])

  useEffect(() => {
    if (isEditing && currentMenu && itemId) {
      const item = (currentMenu.items || []).find((item) => item._id === itemId)
      if (item) {
        setFormData({
          name: item.name,
          description: item.description || "",
          price: item.price,
          image: item.image || "",
          category: item.category || "",
          isAvailable: item.isAvailable ?? true,
        })
      }
    }
  }, [isEditing, currentMenu, itemId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cardId || !menuId) return

    setSubmitting(true)
    setFormError(null)

    try {
      if (isEditing && itemId) {
        // For updating an item
        await CardService.updateMenuItem(cardId, menuId, itemId, formData)
        console.log("Item updated successfully")
      } else {
        // For creating a new item
        await CardService.createMenuItem(cardId, menuId, formData)
        console.log("Item created successfully")
      }
      navigate(`/cards/${username}/menus/${menuId}`)
    } catch (err: any) {
      console.error("Error saving menu item:", err)
      setFormError(err.response?.data?.error || err.message || "Failed to save menu item. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              {isEditing ? "Edit Menu Item" : "Add Menu Item"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? "Update item details" : "Add a new item to your menu"}
            </p>
          </div>
          <button
            onClick={() => navigate(`/cards/${username}/menus/${menuId}`)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Menu
          </button>
        </div>

        {(error || formError) && (
          <div
            className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error || formError}</span>
          </div>
        )}

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-1">
                Name*
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground"
                placeholder="Item Name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground"
                placeholder="Item Description"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-card-foreground mb-1">
                Price*
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleNumberChange}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-card-foreground mb-1">
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground"
                placeholder="Category"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-card-foreground mb-1">
                Image URL
              </label>
              <input
                id="image"
                name="image"
                type="text"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground"
                placeholder="Image URL"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isAvailable"
                name="isAvailable"
                type="checkbox"
                checked={formData.isAvailable}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-card-foreground">
                Available
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/cards/${username}/menus/${menuId}`)}
                className="px-4 py-2 border border-border rounded-md text-card-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                {submitting ? "Saving..." : isEditing ? "Update" : "Add"} Item
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Menu Item Tips</h3>
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
              <span>Use descriptive names that highlight the key ingredients or preparation method</span>
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
              <span>Add detailed descriptions that entice customers and mention special ingredients</span>
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
              <span>Organize items with categories like "Appetizers", "Main Courses", or "Desserts"</span>
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
              <span>
                Toggle availability to easily manage seasonal items or items that are temporarily out of stock
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MenuItemForm

