import API from "./API"
import type { Card, CardListResponse, Menu, MenuItem, MenuListResponse, Lead } from "../types/card"

// Define the CardService object with all methods
const CardService = {
  // Card Methods
  // Get all cards with pagination
  getAllCards: async (page = 1, limit = 10): Promise<CardListResponse> => {
    try {
      return await API.get<CardListResponse>(`/api/cards?page=${page}&limit=${limit}`)
    } catch (error) {
      console.error("Error fetching cards:", error)
      throw error
    }
  },

  // Get all cards for user and sub-users
  getAllCardsForUserAndSubUsers: async (page = 1, limit = 10): Promise<CardListResponse> => {
    try {
      return await API.get<CardListResponse>(`/api/cards/all?page=${page}&limit=${limit}`)
    } catch (error) {
      console.error("Error fetching all cards:", error)
      throw error
    }
  },

  // Get cards by package type
  getCardsByPackageType: async (packageType: string, page = 1, limit = 10): Promise<CardListResponse> => {
    try {
      return await API.get<CardListResponse>(`/api/cards/package/${packageType}?page=${page}&limit=${limit}`)
    } catch (error) {
      console.error(`Error fetching ${packageType} cards:`, error)
      throw error
    }
  },

  // // Check username availability (Backend API not implemented yet)
  // checkUsernameAvailability: async (username: string): Promise<{ exists: boolean }> => {
  //   try {
  //     return await API.get<{ exists: boolean }>(`/api/cards/check-username/${username}`)
  //   } catch (err) {
  //     console.error("Error checking username availability:", err)
  //     return { exists: false }
  //   }
  // },

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

  // Delete a card (soft delete)
  deleteCard: async (id: string): Promise<void> => {
    return API.delete<void>(`/api/cards/${id}`)
  },

  // Duplicate a card
  duplicateCard: async (id: string): Promise<Card> => {
    return API.post<Card>(`/api/cards/${id}/duplicate`)
  },

  // Transfer a card to another user
  transferCard: async (id: string, userId: string): Promise<Card> => {
    return API.post<Card>(`/api/cards/${id}/transfer`, { userId })
  },

  // Change package type
  changePackageType: async (id: string, packageType: string): Promise<Card> => {
    return API.put<Card>(`/api/cards/${id}/package-type`, { packageType })
  },

  // Update package details
  updatePackageDetails: async (id: string, details: any): Promise<Card> => {
    return API.put<Card>(`/api/cards/${id}/package-details`, details)
  },

  // Link menu to restaurant card
  linkMenuToRestaurantCard: async (id: string, menuId: string): Promise<Card> => {
    return API.put<Card>(`/api/cards/${id}/link-menu`, { menuId })
  },

  // Get deleted cards
  getDeletedCards: async (): Promise<CardListResponse> => {
    return API.get<CardListResponse>(`/api/cards/trash`)
  },

  // Restore a deleted card
  restoreCard: async (id: string): Promise<Card> => {
    return API.post<Card>(`/api/cards/${id}/restore`)
  },

  // Permanently delete a card
  permanentlyDeleteCard: async (id: string): Promise<void> => {
    return API.delete<void>(`/api/cards/${id}/permanent`)
  },

  // Download vCard for a card
  downloadVCard: async (username: string): Promise<void> => {
    // This will trigger a direct download through the browser
    window.location.href = `/api/cards/username/${username}/vcard`
  },

  // Menu Methods
  // Get all menus for a card
  getCardMenus: async (cardId: string): Promise<MenuListResponse> => {
    try {
      const response = await API.get<any>(`/api/cards/${cardId}/menus`)

      // Handle the response format
      if (response && Array.isArray(response)) {
        return {
          menus: response,
          total: response.length,
        }
      } else if (response && response.data && Array.isArray(response.data)) {
        return {
          menus: response.data,
          total: response.count || response.data.length,
        }
      }

      return { menus: [], total: 0 }
    } catch (error) {
      console.error("Error fetching menus:", error)
      return { menus: [], total: 0 }
    }
  },

  // Get a menu by ID
  getMenuById: async (cardId: string, menuId: string): Promise<Menu> => {
    try {
      const response = await API.get<any>(`/api/cards/${cardId}/menus/${menuId}`)
      return response.data || response
    } catch (error) {
      console.error("Error fetching menu:", error)
      throw error
    }
  },

  // Create a new menu
  createMenu: async (cardId: string, menuData: Partial<Menu>): Promise<Menu> => {
    try {
      const response = await API.post<any>(`/api/cards/${cardId}/menus`, menuData)
      return response.data || response
    } catch (error) {
      console.error("Error creating menu:", error)
      throw error
    }
  },

  // Update a menu
  updateMenu: async (cardId: string, menuId: string, menuData: Partial<Menu>): Promise<Menu> => {
    try {
      const response = await API.put<any>(`/api/cards/${cardId}/menus/${menuId}`, menuData)
      return response.data || response
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
      return response.data || response
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
      return response.data || response
    } catch (error) {
      console.error("Error updating menu item:", error)
      throw error
    }
  },

  // Delete a menu item
  deleteMenuItem: async (cardId: string, menuId: string, itemId: string): Promise<void> => {
    return API.delete<void>(`/api/cards/${cardId}/menus/${menuId}/items/${itemId}`)
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
}

export default CardService

