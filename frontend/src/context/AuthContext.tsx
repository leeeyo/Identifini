"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, useCallback } from "react"
import API from "../services/API"
import AuthService from "../services/AuthService"

// Export the User interface so it can be imported elsewhere
export interface User {
  _id: string
  username: string
  name?: string
  email?: string
  role: string
  profilePicture?: string
  themePreference?: "light" | "dark" | "system"
  created_at?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  socialLogin: (provider: string, token: string, userData?: any) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  updateThemePreference: (theme: "light" | "dark" | "system") => Promise<void>
}

interface RegisterData {
  username: string
  password: string
  name?: string
  email?: string
  themePreference?: "light" | "dark" | "system"
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
      const response = await AuthService.login({ email: username, password })

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

  // Social login function
  const socialLogin = async (provider: string, token: string, userData?: any) => {
    setIsLoading(true)
    try {
      const response = await AuthService.socialLogin({
        provider,
        token,
        userData,
      })

      // Save user and token to state and localStorage
      setUser(response)
      setToken(response.token)
      localStorage.setItem("user", JSON.stringify(response))
      localStorage.setItem("token", response.token)

      // Set the token in the API headers
      API.setAuthToken(response.token)
    } catch (error) {
      console.error(`${provider} login error:`, error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await AuthService.register(userData)

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
  const logout = useCallback(() => {
    // Clear user and token from state and localStorage
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")

    // Remove the token from the API headers
    API.setAuthToken(null)
  }, [])

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true)
    try {
      console.log("Sending profile update to API:", userData)

      // Explicitly send the profile picture in the request
      const response = await API.put<User>("/api/auth/profile", {
        name: userData.name,
        email: userData.email,
        profilePicture: userData.profilePicture,
        themePreference: userData.themePreference,
      })

      console.log("Profile update response:", response)

      if (!response) {
        throw new Error("No response received from server")
      }

      // Create a properly merged user object with all fields
      const updatedUser = {
        ...user,
        ...response,
        // Ensure profilePicture is explicitly set from the response or userData
        profilePicture: response.profilePicture || userData.profilePicture || user?.profilePicture,
        themePreference: response.themePreference || userData.themePreference || user?.themePreference,
      }

      console.log("Updated user object:", updatedUser)

      // Update state and localStorage - create a new object to ensure React detects the change
      setUser({ ...updatedUser })
      localStorage.setItem("user", JSON.stringify(updatedUser))

      // Force a re-render of components that use the user object
      const event = new Event("storage")
      window.dispatchEvent(event)

      return Promise.resolve()
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update theme preference function
  const updateThemePreference = async (theme: "light" | "dark" | "system") => {
    try {
      const response = await API.put<{ themePreference: "light" | "dark" | "system" }>("/api/auth/theme", {
        themePreference: theme,
      })

      if (!response) {
        throw new Error("No response received from server")
      }

      // Update the user object with the new theme preference
      if (user) {
        const updatedUser = {
          ...user,
          themePreference: response.themePreference,
        }

        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))

        // Force a re-render of components that use the user object
        const event = new Event("storage")
        window.dispatchEvent(event)
      }

      return Promise.resolve()
    } catch (error) {
      console.error("Update theme preference error:", error)
      throw error
    }
  }

  // Update the useEffect for storage event listener to be more specific
  // and prevent it from interfering with form inputs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Only react to specific storage changes related to auth
      if (event.key === "user" || event.key === "token") {
        // Force re-render when user data changes
        setUser(event.key === "user" && event.newValue ? JSON.parse(event.newValue) : null)
        setToken(event.key === "token" ? event.newValue : null)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        socialLogin,
        logout,
        updateProfile,
        updateThemePreference,
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

