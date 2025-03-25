"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./Navbar.css"

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path: string) => {
    return location.pathname === path ? "active" : ""
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
          <span></span>
          <span></span>
          <span></span>
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
                <Link to="/profile" className="user-info">
                  {user?.profilePicture ? (
                    <div
                      className="user-avatar-image"
                      style={{ backgroundImage: `url(${user.profilePicture}?${userKey})` }}
                      aria-label={`${user?.name || user?.username}'s profile picture`}
                    ></div>
                  ) : (
                    <div className="user-avatar">{user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}</div>
                  )}
                  <span className="user-name">{user?.name || user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="logout-button"
                  style={{
                    backgroundColor: "transparent",
                    color: "#666",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: 500,
                    cursor: "pointer",
                    boxShadow: "none",
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-links">
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

