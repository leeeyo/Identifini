"use client"

import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./Navbar.css"

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Card App</Link>
      </div>
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/" className="navbar-item">
              Dashboard
            </Link>
            <Link to="/create-card" className="navbar-item">
              Create Card
            </Link>
            <Link to="/profile" className="navbar-item">
              Profile
            </Link>
            <button onClick={handleLogout} className="navbar-button logout-button">
              Logout
            </button>
            {user && <span className="navbar-username">Hello, {user.name || user.username}</span>}
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-item">
              Login
            </Link>
            <Link to="/register" className="navbar-item">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar

