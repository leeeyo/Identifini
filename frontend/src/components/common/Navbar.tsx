"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import ThemeToggle from "./ThemeToggle"
import "./Navbar.css"

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  // Add a key to force re-render when user changes
  const [userKey, setUserKey] = useState(0)

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
      setUserKey((prev) => prev + 1)
    }
  }, [user])

  // Add a storage event listener to update the navbar when the user data changes
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render when user data changes
      setUserKey((prev) => prev + 1)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path: string) => {
    return location.pathname === path ? "active" : ""
  }

  // Function to handle profile picture errors
  const handleProfilePictureError = (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
    // Hide the image background and show the fallback avatar
    if (e.currentTarget) {
      e.currentTarget.style.backgroundImage = "none"
      e.currentTarget.classList.add("profile-picture-error")

      // Create and append the fallback initial if it doesn't exist
      if (!e.currentTarget.querySelector(".fallback-initial")) {
        const initialSpan = document.createElement("span")
        initialSpan.className = "fallback-initial"
        initialSpan.textContent = user?.name?.charAt(0) || user?.username?.charAt(0) || "U"
        e.currentTarget.appendChild(initialSpan)
      }
    }
  }

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/67e1dbaf8b50a.jpg-A6PBjlrZZBrPR9G3NzhMZpZZwMTDzY.jpeg"
              alt="Identifini Logo"
              className="logo-image"
            />
            <span className="logo-text">Identifini</span>
          </Link>
        </div>

        <div className="navbar-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className={mobileMenuOpen ? "rotate-45 translate-y-[6px]" : ""}></span>
          <span className={mobileMenuOpen ? "opacity-0" : ""}></span>
          <span className={mobileMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""}></span>
        </div>

        <div className={`navbar-menu ${mobileMenuOpen ? "active" : ""}`}>
          {isAuthenticated ? (
            <>
              <div className="navbar-links">
                <Link to="/" className={isActive("/")}>
                  Dashboard
                </Link>
                <Link to="/create-card" className={isActive("/create-card")}>
                  Create Card
                </Link>
                <Link to="/profile" className={isActive("/profile")}>
                  Profile
                </Link>
              </div>
              {/* Update the user avatar rendering to ensure it always shows the latest profile picture */}
              <div className="navbar-actions" key={userKey}>
                <ThemeToggle className="theme-toggle-navbar" />
                <div className="relative" ref={userMenuRef}>
                  <button className="user-info" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                    {user?.profilePicture ? (
                      <div
                        className="user-avatar-image"
                        style={{ backgroundImage: `url(${user.profilePicture}?v=${userKey})` }}
                        aria-label={`${user?.name || user?.username}'s profile picture`}
                        onError={handleProfilePictureError}
                      >
                        {/* Fallback will be added here if image fails to load */}
                      </div>
                    ) : (
                      <div className="user-avatar">{user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}</div>
                    )}
                    <span className="user-name">{user?.name || user?.username}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 ml-1 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <Link to="/profile" className="user-dropdown-item">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
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
                      </Link>
                      <Link to="/create-card" className="user-dropdown-item">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Card
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="user-dropdown-item text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
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
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-links">
              <ThemeToggle className="theme-toggle-navbar" />
              <Link to="/login" className={isActive("/login")}>
                Login
              </Link>
              <Link to="/register" className={isActive("/register")}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

