"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import CardService from "../../services/CardService"

interface MenuFormData {
  title: string
  description: string
  isActive: boolean
  displayOrder: number
}

const MenuForm: React.FC = () => {
  const { username, menuId } = useParams<{ username: string; menuId: string }>()
  const isEditing = Boolean(menuId)
  const navigate = useNavigate()

  const [formData, setFormData] = useState<MenuFormData>({
    title: "",
    description: "",
    isActive: true,
    displayOrder: 0,
  })

  const [loading, setLoading] = useState(false)
  const [cardLoading, setCardLoading] = useState(true)
  const [cardId, setCardId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  // Fetch card ID and menu data if editing
  useEffect(() => {
    const fetchCardAndMenu = async () => {
      if (!username) return

      try {
        setCardLoading(true)
        // Get card ID from username
        const card = await CardService.getCardByUsername(username)
        if (!card || (!card._id && !card.id)) {
          setMessage({ type: "error", text: "Card not found" })
          return
        }

        const id = (card._id || card.id) as string
        setCardId(id)

        // If editing, fetch menu data
        if (isEditing && menuId) {
          try {
            const menu = await CardService.getMenuById(id, menuId)
            setFormData({
              title: menu.title,
              description: menu.description || "",
              isActive: menu.isActive,
              displayOrder: menu.displayOrder,
            })
          } catch (err) {
            console.error("Error fetching menu:", err)
            setMessage({ type: "error", text: "Failed to fetch menu data" })
          }
        }
      } catch (err) {
        console.error("Error fetching card:", err)
        setMessage({ type: "error", text: "Failed to fetch card information" })
      } finally {
        setCardLoading(false)
      }
    }

    fetchCardAndMenu()
  }, [username, menuId, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cardId) {
      setMessage({ type: "error", text: "Card information not available" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      if (isEditing && menuId) {
        await CardService.updateMenu(cardId, menuId, formData)
        setMessage({ type: "success", text: "Menu updated successfully!" })
      } else {
        await CardService.createMenu(cardId, formData)
        setMessage({ type: "success", text: "Menu created successfully!" })
      }

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate(`/cards/${username}/menus`)
      }, 1500)
    } catch (err: any) {
      console.error("Error saving menu:", err)
      setMessage({
        type: "error",
        text: err.response?.data?.error || err.message || "Failed to save menu",
      })
      setLoading(false)
    }
  }

  if (cardLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
              <div className="h-24 w-full bg-muted animate-pulse rounded"></div>
              <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">{isEditing ? "Edit Menu" : "Create Menu"}</h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? "Update your menu details" : "Create a new menu to showcase your offerings"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/cards/${username}/menus`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Menus
            </Link>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "error"
                ? "bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-800 text-red-700 dark:text-red-400"
                : "bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-800 text-green-700 dark:text-green-400"
            }`}
          >
            <p>{message.text}</p>
          </div>
        )}

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-card-foreground mb-1">
                Title*
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground"
                placeholder="Menu Title"
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
                placeholder="Menu Description"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="displayOrder" className="block text-sm font-medium text-card-foreground mb-1">
                Display Order <span className="text-xs text-muted-foreground">(Lower numbers appear first)</span>
              </label>
              <input
                id="displayOrder"
                name="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This determines the order in which menus are displayed. Menus with lower numbers will appear first.
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-card-foreground">
                Active
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Menu" : "Create Menu"}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Menu Creation Tips</h3>
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
              <span>
                Use a clear, descriptive title that represents the type of menu (e.g., "Lunch Menu", "Desserts")
              </span>
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
              <span>Add a detailed description to help customers understand what to expect from this menu</span>
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
              <span>Set the display order to control where this menu appears relative to your other menus</span>
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
              <span>Toggle the "Active" switch to control whether this menu is visible to customers</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MenuForm

