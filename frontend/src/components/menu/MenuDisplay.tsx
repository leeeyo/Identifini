"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import CardService from "../../services/CardService"
import type { Menu, MenuItem } from "../../types/card"

// This component is for displaying the menu to customers
const MenuDisplay: React.FC = () => {
  const { username, menuId } = useParams<{ username: string; menuId: string }>()
  const [menus, setMenus] = useState<Menu[]>([])
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [cardId, setCardId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCard = async () => {
      if (!username) return

      try {
        setLoading(true)
        // First get the card to get its ID
        const card = await CardService.getCardByUsername(username)

        // Store the card ID for later use
        if (card && (card._id || card.id)) {
          const id = (card._id || card.id) as string
          setCardId(id)

          // Now fetch the menu data
          if (menuId) {
            const menu = await CardService.getMenuById(id, menuId as string)
            setCurrentMenu(menu)
          } else {
            const response = await CardService.getCardMenus(id)
            setMenus(response.menus || [])
          }
        } else {
          setError("Card not found")
        }
      } catch (err) {
        console.error("Error fetching card or menus:", err)
        setError("Failed to load menu")
      } finally {
        setLoading(false)
      }
    }

    fetchCard()
  }, [username, menuId])

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="h-12 w-3/4 mx-auto mb-6 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 w-full bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  // If we're looking at a specific menu
  if (menuId && currentMenu) {
    // Group items by category
    const categories = (currentMenu.items || []).reduce(
      (acc, item) => {
        if (!item.isAvailable) return acc

        const category = item.category || "Uncategorized"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(item)
        return acc
      },
      {} as Record<string, MenuItem[]>,
    )

    return (
      <div className="container mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{currentMenu.title}</h1>
          {currentMenu.description && <p className="text-gray-600 mt-2">{currentMenu.description}</p>}
        </div>

        {Object.keys(categories).length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No items available in this menu</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(categories).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div key={item._id} className="border rounded-lg p-4 flex justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <div className="font-semibold whitespace-nowrap">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // If we're showing all menus
  if (menus.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-10">
          <p className="text-gray-500">No menus available</p>
        </div>
      </div>
    )
  }

  // Show all active menus in tabs
  const activeMenus = menus.filter((menu) => menu.isActive)

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Our Menus</h1>
      </div>

      <div className="flex flex-col space-y-8">
        {activeMenus.map((menu) => (
          <div key={menu._id} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-2">{menu.title}</h2>
            {menu.description && <p className="text-gray-600 mb-4">{menu.description}</p>}

            {(menu.items || []).length === 0 ? (
              <p className="text-center text-gray-500 py-4">No items in this menu</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(menu.items || [])
                  .filter((item) => item.isAvailable)
                  .map((item) => (
                    <div key={item._id} className="border rounded-lg p-4 flex justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <div className="font-semibold whitespace-nowrap">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MenuDisplay

