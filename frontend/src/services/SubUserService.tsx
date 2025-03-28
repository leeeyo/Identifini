import API from "./API"
import type { User } from "../types/user"

interface SubUser extends User {
  parentUser: string
  permissions: string[]
}

interface SubUserListResponse {
  subUsers: SubUser[]
  total: number
}

const SubUserService = {
  // Get all sub-users
  getSubUsers: async (): Promise<SubUserListResponse> => {
    try {
      return await API.get<SubUserListResponse>(`/api/sub-users`)
    } catch (error) {
      console.error("Error fetching sub-users:", error)
      return { subUsers: [], total: 0 }
    }
  },

  // Create a new sub-user
  createSubUser: async (userData: Partial<SubUser>): Promise<SubUser> => {
    try {
      return await API.post<SubUser>(`/api/sub-users`, userData)
    } catch (error) {
      console.error("Error creating sub-user:", error)
      throw error
    }
  },

  // Get a sub-user by ID
  getSubUser: async (id: string): Promise<SubUser> => {
    try {
      return await API.get<SubUser>(`/api/sub-users/${id}`)
    } catch (error) {
      console.error("Error fetching sub-user:", error)
      throw error
    }
  },

  // Update a sub-user
  updateSubUser: async (id: string, userData: Partial<SubUser>): Promise<SubUser> => {
    try {
      return await API.put<SubUser>(`/api/sub-users/${id}`, userData)
    } catch (error) {
      console.error("Error updating sub-user:", error)
      throw error
    }
  },

  // Delete a sub-user
  deleteSubUser: async (id: string): Promise<void> => {
    try {
      return await API.delete<void>(`/api/sub-users/${id}`)
    } catch (error) {
      console.error("Error deleting sub-user:", error)
      throw error
    }
  },
}

export default SubUserService

