"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "./AuthContext"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateThemePreference, isAuthenticated } = useAuth()

  // Get initial theme based on user preference or system preference
  const getInitialTheme = (): Theme => {
    // If user is authenticated and has a theme preference
    if (isAuthenticated && user?.themePreference) {
      if (user.themePreference === "light" || user.themePreference === "dark") {
        return user.themePreference
      }

      // If preference is 'system', check system preference
      if (user.themePreference === "system") {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      }
    }

    // Check localStorage as fallback
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme && ["light", "dark"].includes(savedTheme)) {
      return savedTheme
    }

    // Check user's system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark"
    }

    return "light"
  }

  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Apply theme to document when it changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  // Update theme when user preference changes
  useEffect(() => {
    if (isAuthenticated && user?.themePreference) {
      if (user.themePreference === "light" || user.themePreference === "dark") {
        setTheme(user.themePreference)
      } else if (user.themePreference === "system") {
        const systemTheme =
          window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        setTheme(systemTheme)
      }
    }
  }, [user, isAuthenticated])

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    // If user is authenticated, update theme preference in backend
    if (isAuthenticated) {
      try {
        await updateThemePreference(newTheme)
      } catch (error) {
        console.error("Failed to update theme preference:", error)
      }
    }
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

