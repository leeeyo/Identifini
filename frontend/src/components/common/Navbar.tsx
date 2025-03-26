"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import ThemeToggle from "./ThemeToggle"

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [userKey, setUserKey] = useState(Date.now())

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Force re-render when user changes (including profile picture updates)
  useEffect(() => {
    if (user) {
      setUserKey(Date.now())
    }
  }, [user])

  // Add a custom event listener to update the navbar when the user data changes
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render when user data changes
      setUserKey(Date.now())
    }

    // Listen for both storage events and custom events
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("user-updated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("user-updated", handleStorageChange)
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // Close user menu when clicking outside - only when menu is open
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle clicks outside the user menu when it's open
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    // Only add the event listener when the menu is open
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [userMenuOpen])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  // Function to handle profile picture errors
  const handleProfilePictureError = (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
    // Hide the image background and show the fallback avatar
    if (e.currentTarget) {
      e.currentTarget.style.backgroundImage = "none"
      e.currentTarget.classList.add("bg-gradient-to-br")
      e.currentTarget.classList.add("from-primary-500")
      e.currentTarget.classList.add("to-primary-600")

      // Create and append the fallback initial if it doesn't exist
      if (!e.currentTarget.querySelector(".fallback-initial")) {
        const initialSpan = document.createElement("span")
        initialSpan.className = "text-white font-semibold"
        initialSpan.textContent = user?.name?.charAt(0) || user?.username?.charAt(0) || "U"
        e.currentTarget.appendChild(initialSpan)
      }
    }
  }

  // Get profile picture URL with timestamp to prevent caching
  const getProfilePictureUrl = () => {
    if (!user?.profilePicture) return null

    // Add timestamp to prevent caching
    return `${user.profilePicture}?t=${userKey}`
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#121826] shadow-sm dark:shadow-none border-b border-gray-200 dark:border-[#2D3748] transition-all duration-300 ${
        scrolled ? "h-16" : "h-[70px]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center transition-transform duration-200 hover:scale-105">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/67e1dbaf8b50a.jpg-A6PBjlrZZBrPR9G3NzhMZpZZwMTDzY.jpeg"
              alt="Identifini Logo"
              className="h-9 w-9 rounded-lg mr-2.5"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Identifini
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2D3748] focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className={`h-6 w-6 ${mobileMenuOpen ? "hidden" : "block"}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              className={`h-6 w-6 ${mobileMenuOpen ? "block" : "hidden"}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {isAuthenticated ? (
            <>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive("/")
                      ? "bg-primary-50 text-primary-700 dark:bg-[#2C3346] dark:text-primary-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2D3748]"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-card"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive("/create-card")
                      ? "bg-primary-50 text-primary-700 dark:bg-[#2C3346] dark:text-primary-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2D3748]"
                  }`}
                >
                  Create Card
                </Link>
                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive("/profile")
                      ? "bg-primary-50 text-primary-700 dark:bg-[#2C3346] dark:text-primary-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2D3748]"
                  }`}
                >
                  Profile
                </Link>
              </div>

              <div className="flex items-center space-x-4" key={userKey}>
                <ThemeToggle />

                <div className="relative" ref={userMenuRef}>
                  <button
                    className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    {user?.profilePicture ? (
                      <div
                        className="w-9 h-9 rounded-full bg-cover bg-center flex items-center justify-center"
                        style={{ backgroundImage: `url(${getProfilePictureUrl()})` }}
                        aria-label={`${user?.name || user?.username}'s profile picture`}
                        onError={handleProfilePictureError}
                      >
                        {/* Fallback will be added here if image fails to load */}
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                      {user?.name || user?.username}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-[#1E293B] ring-1 ring-black ring-opacity-5 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2D3748]"
                      >
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          My Profile
                        </div>
                      </Link>
                      <Link
                        to="/create-card"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2D3748]"
                      >
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create Card
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-red-500 dark:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                to="/login"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive("/login")
                    ? "bg-primary-50 text-primary-700 dark:bg-[#2C3346] dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2D3748]"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-600 dark:bg-[#4169E1] dark:hover:bg-[#3A5CD0] transition-colors duration-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden ${
          mobileMenuOpen ? "block" : "hidden"
        } bg-white dark:bg-[#1E293B] shadow-md border-t border-gray-200 dark:border-[#2D3748]`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/")
                    ? "bg-primary-50 text-primary-700 dark:bg-[#2C3346] dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2D3748]"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/create-card"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/create-card")
                    ? "bg-primary-50 text-primary-700 dark:bg-[#2C3346] dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2D3748]"
                }`}
              >
                Create Card
              </Link>
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/profile")
                    ? "bg-primary-50 text-primary-700 dark:bg-[#2C3346] dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2D3748]"
                }`}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/login")
                    ? "bg-primary-50 text-primary-700 dark:bg-[#2C3346] dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2D3748]"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary-600 dark:bg-[#4169E1] dark:hover:bg-[#3A5CD0]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

