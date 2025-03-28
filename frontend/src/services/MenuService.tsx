import API from "./API"
import type { Menu, MenuListResponse } from "../types/card"

const MenuService = {
  // Get all menus for the current user
  getAllMenus: async (page = 1, limit = 10): Promise<MenuListResponse> => {
    try {
      const response = await API.get<any>(`/api/menus?page=${page}&limit=${limit}`)

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
  getMenuById: async (menuId: string): Promise<Menu> => {
    try {
      const response = await API.get<any>(`/api/menus/${menuId}`)
      return response.data || response
    } catch (error) {
      console.error("Error fetching menu:", error)
      throw error
    }
  },

  // Get deleted menus
  getDeletedMenus: async (): Promise<MenuListResponse> => {
    try {
      const response = await API.get<any>(`/api/menus/trash`)

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
      console.error("Error fetching deleted menus:", error)
      return { menus: [], total: 0 }
    }
  },

  // Restore a deleted menu
  restoreMenu: async (menuId: string): Promise<Menu> => {
    try {
      const response = await API.post<any>(`/api/menus/${menuId}/restore`)
      return response.data || response
    } catch (error) {
      console.error("Error restoring menu:", error)
      throw error
    }
  },

  // Permanently delete a menu
  permanentlyDeleteMenu: async (menuId: string): Promise<void> => {
    return API.delete<void>(`/api/menus/${menuId}/permanent`)
  },
}

export default MenuService

