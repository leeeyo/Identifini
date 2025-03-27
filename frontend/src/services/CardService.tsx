import API from "./API"
import type { Card } from "../types/card"

// Define response types
interface CardListResponse {
  cards: Card[]
  total?: number
}

interface Lead {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  notes?: string
  cardUsername: string
  createdAt: string
}

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  isAvailable: boolean
}

interface Menu {
  _id: string
  card: string
  title: string
  description: string
  items: MenuItem[]
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

interface MenuListResponse {
  menus: Menu[]
  total?: number
}

// Define the CardService object with all methods
const CardService = {
  // Get all cards with pagination
  getAllCards: async (page = 1, limit = 10): Promise<CardListResponse> => {
    try {
      console.log(`Trying to fetch cards from /api/cards?page=${page}&limit=${limit}`)
      return await API.get<CardListResponse>(`/api/cards?page=${page}&limit=${limit}`)
    } catch (error) {
      console.error("Regular endpoint failed, trying test endpoint")

      // If that fails, try the test endpoint
      try {
        console.log("Trying to fetch cards from /api/cards-test")
        const testResponse = await API.get<any>("/api/cards-test")
        console.log("Test endpoint response:", testResponse)
        return {
          cards: testResponse.cards || [],
          total: testResponse.cards?.length || 0,
        }
      } catch (testError) {
        console.error("Both endpoints failed")
        throw error // Throw the original error
      }
    }
  },
  // Add this new method to the CardService object
  checkUsernameAvailability: async (username: string): Promise<{ exists: boolean }> => {
    try {
      return await API.get<{ exists: boolean }>(`/api/cards/check-username/${username}`)
    } catch (err) {
      console.error("Error checking username availability:", err)
      // If the API endpoint doesn't exist yet, simulate a response
      // This allows the frontend to work even if the backend isn't updated yet
      return { exists: false }
    }
  },

  // Get a card by ID
  getCardById: async (id: string): Promise<Card> => {
    return API.get<Card>(`/api/cards/${id}`)
  },

  // Get a card by username
  getCardByUsername: async (username: string): Promise<Card> => {
    return API.get<Card>(`/api/cards/username/${username}`)
  },

  // Create a new card
  createCard: async (cardData: Partial<Card>): Promise<Card> => {
    return API.post<Card>("/api/cards", cardData)
  },

  // Update a card
  updateCard: async (id: string, cardData: Partial<Card>): Promise<Card> => {
    return API.put<Card>(`/api/cards/${id}`, cardData)
  },

  // Delete a card
  deleteCard: async (id: string): Promise<void> => {
    return API.delete<void>(`/api/cards/${id}`)
  },

  // Duplicate a card
  duplicateCard: async (id: string): Promise<Card> => {
    return API.post<Card>(`/api/cards/${id}/duplicate`)
  },

  // Get leads for a card
  getCardLeads: async (username: string): Promise<Lead[]> => {
    return API.get<Lead[]>(`/api/cards/username/${username}/leads`)
  },

  // Submit lead for a card
  submitLead: async (cardUsername: string, leadData: any): Promise<any> => {
    return API.post<any>(`/api/cards/username/${cardUsername}/leads`, leadData)
  },

  // Delete a lead
  deleteLead: async (cardUsername: string, leadId: string): Promise<void> => {
    return API.delete<void>(`/api/cards/username/${cardUsername}/leads/${leadId}`)
  },

  
    // Download vCard for a card
    downloadVCard: async (username: string): Promise<void> => {
      // This will trigger a direct download through the browser
      window.location.href = `/api/cards/username/${username}/vcard`
    },


 // Menu Methods
  // Get all menus for a card
  getCardMenus: async (cardId: string): Promise<MenuListResponse> => {
    console.log(`Fetching menus for card ID: ${cardId}`)
    try {
      const response = await API.get<any>(`/api/cards/${cardId}/menus`)
      console.log("Menus response:", response)

      // Handle the actual API response format which has menus in the 'data' property
      if (response && response.data && Array.isArray(response.data)) {
        return {
          menus: response.data,
          total: response.count || response.data.length,
        }
      }

      // Fallback for unexpected response format
      console.warn("Unexpected response format:", response)
      return { menus: [], total: 0 }
    } catch (error) {
      console.error("Error fetching menus:", error)
      // Return empty menus array on error
      return { menus: [], total: 0 }
    }
  },

  // Get a menu by ID
  getMenuById: async (cardId: string, menuId: string): Promise<Menu> => {
    try {
      const response = await API.get<any>(`/api/cards/${cardId}/menus/${menuId}`)
      // Handle the actual API response format which has the menu in the 'data' property
      if (response && response.data) {
        return response.data
      }
      return response
    } catch (error) {
      console.error("Error fetching menu:", error)
      throw error
    }
  },

  // Create a new menu
  createMenu: async (cardId: string, menuData: Partial<Menu>): Promise<Menu> => {
    console.log(`Creating menu for card ID: ${cardId}`, menuData)
    try {
      const response = await API.post<any>(`/api/cards/${cardId}/menus`, menuData)
      console.log("Create menu response:", response)

      // Handle the actual API response format which has the menu in the 'data' property
      if (response && response.data) {
        return response.data
      }

      return response
    } catch (error) {
      console.error("Error creating menu:", error)
      throw error
    }
  },

  // Update a menu
  updateMenu: async (cardId: string, menuId: string, menuData: Partial<Menu>): Promise<Menu> => {
    try {
      const response = await API.put<any>(`/api/cards/${cardId}/menus/${menuId}`, menuData)
      // Handle the actual API response format which has the menu in the 'data' property
      if (response && response.data) {
        return response.data
      }
      return response
    } catch (error) {
      console.error("Error updating menu:", error)
      throw error
    }
  },

  // Delete a menu
  deleteMenu: async (cardId: string, menuId: string): Promise<void> => {
    return API.delete<void>(`/api/cards/${cardId}/menus/${menuId}`)
  },

  // Menu Item Methods
  // Get all menu items
  getMenuItems: async (cardId: string, menuId: string): Promise<MenuItem[]> => {
    return API.get<MenuItem[]>(`/api/cards/${cardId}/menus/${menuId}/items`)
  },

  // Get a menu item by ID
  getMenuItemById: async (cardId: string, menuId: string, itemId: string): Promise<MenuItem> => {
    return API.get<MenuItem>(`/api/cards/${cardId}/menus/${menuId}/items/${itemId}`)
  },

  // Create a new menu item
  createMenuItem: async (cardId: string, menuId: string, itemData: Partial<MenuItem>): Promise<MenuItem> => {
    try {
      const response = await API.post<any>(`/api/cards/${cardId}/menus/${menuId}/items`, itemData)
      console.log("Create menu item response:", response)

      // Handle the actual API response format which might have the item in the 'data' property
      if (response && response.data) {
        return response.data
      }

      return response
    } catch (error) {
      console.error("Error creating menu item:", error)
      throw error
    }
  },

  // Update a menu item
  updateMenuItem: async (
    cardId: string,
    menuId: string,
    itemId: string,
    itemData: Partial<MenuItem>,
  ): Promise<MenuItem> => {
    try {
      const response = await API.put<any>(`/api/cards/${cardId}/menus/${menuId}/items/${itemId}`, itemData)
      console.log("Update menu item response:", response)

      // Handle the actual API response format which might have the item in the 'data' property
      if (response && response.data) {
        return response.data
      }

      return response
    } catch (error) {
      console.error("Error updating menu item:", error)
      throw error
    }
  },

  // Delete a menu item
  deleteMenuItem: async (cardId: string, menuId: string, itemId: string): Promise<void> => {
    return API.delete<void>(`/api/cards/${cardId}/menus/${menuId}/items/${itemId}`)
  },
}

export default CardService