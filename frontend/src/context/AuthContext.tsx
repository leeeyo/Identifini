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
  created_at?: string
  token?: string
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
      const response = await AuthService.login({ email: username, password })

      // Save user and token to state and localStorage
      setUser(response)
      // Handle potentially undefined token
      const userToken = response.token || null
      setToken(userToken)
      localStorage.setItem("user", JSON.stringify(response))

      // Only set token in localStorage if it exists
      if (userToken) {
        localStorage.setItem("token", userToken)
        // Set the token in the API headers
        API.setAuthToken(userToken)
      }
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
      // Handle potentially undefined token
      const userToken = response.token || null
      setToken(userToken)
      localStorage.setItem("user", JSON.stringify(response))

      // Only set token in localStorage if it exists
      if (userToken) {
        localStorage.setItem("token", userToken)
        // Set the token in the API headers
        API.setAuthToken(userToken)
      }
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
      // Handle potentially undefined token
      const userToken = response.token || null
      setToken(userToken)
      localStorage.setItem("user", JSON.stringify(response))

      // Only set token in localStorage if it exists
      if (userToken) {
        localStorage.setItem("token", userToken)
        // Set the token in the API headers
        API.setAuthToken(userToken)
      }
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
      }

      console.log("Updated user object:", updatedUser)

      // Update state and localStorage - create a new object to ensure React detects the change
      setUser({ ...updatedUser })
      localStorage.setItem("user", JSON.stringify(updatedUser))

      // Force a re-render of components that use the user object
      window.dispatchEvent(new Event("storage"))

      // Dispatch a custom event for components that might not listen to storage events
      window.dispatchEvent(new CustomEvent("user-updated"))

      return Promise.resolve()
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update the useEffect for storage event listener to be more specific
  // and prevent it from interfering with form inputs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Only react to specific storage changes related to auth
      if (event.key === "user" || event.key === "token") {
        // Force re-render when user data changes
        if (event.key === "user" && event.newValue) {
          const userData = JSON.parse(event.newValue)
          setUser(userData)
        } else {
          setUser(null)
        }
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

