import API from "./API"
import type { CardListResponse, MenuListResponse } from "../types/card"
import type { User } from "../types/user"

interface UserListResponse {
  users: User[]
  total: number
}

const SearchService = {
  // Search cards
  searchCards: async (query: string, page = 1, limit = 10): Promise<CardListResponse> => {
    try {
      return await API.get<CardListResponse>(
        `/api/search/cards?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      )
    } catch (error) {
      console.error("Error searching cards:", error)
      return { cards: [], total: 0 }
    }
  },

  // Search users
  searchUsers: async (query: string, page = 1, limit = 10): Promise<UserListResponse> => {
    try {
      return await API.get<UserListResponse>(
        `/api/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      )
    } catch (error) {
      console.error("Error searching users:", error)
      return { users: [], total: 0 }
    }
  },

  // Search menus
  searchMenus: async (query: string, page = 1, limit = 10): Promise<MenuListResponse> => {
    try {
      return await API.get<MenuListResponse>(
        `/api/search/menus?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      )
    } catch (error) {
      console.error("Error searching menus:", error)
      return { menus: [], total: 0 }
    }
  },
}

export default SearchService

