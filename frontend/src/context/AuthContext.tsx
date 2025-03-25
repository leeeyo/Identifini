"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import API from "../services/API"

interface User {
  _id: string
  username: string
  name?: string
  email?: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
}

interface RegisterData {
  username: string
  password: string
  name?: string
  email?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)

      // Set the token in the API headers
      API.setAuthToken(storedToken)
    }

    setIsLoading(false)
  }, [])

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await API.post<{ token: string } & User>("/api/auth/login", { username, password })

      // Save user and token to state and localStorage
      setUser(response)
      setToken(response.token)
      localStorage.setItem("user", JSON.stringify(response))
      localStorage.setItem("token", response.token)

      // Set the token in the API headers
      API.setAuthToken(response.token)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await API.post<{ token: string } & User>("/api/auth/register", userData)

      // Save user and token to state and localStorage
      setUser(response)
      setToken(response.token)
      localStorage.setItem("user", JSON.stringify(response))
      localStorage.setItem("token", response.token)

      // Set the token in the API headers
      API.setAuthToken(response.token)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    // Clear user and token from state and localStorage
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")

    // Remove the token from the API headers
    API.setAuthToken(null)
  }

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true)
    try {
      const response = await API.put<User>("/api/auth/profile", userData)

      // Update user in state and localStorage
      setUser((prev) => (prev ? { ...prev, ...response } : response))
      localStorage.setItem("user", JSON.stringify({ ...user, ...response }))
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

