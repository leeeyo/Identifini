"use client"

import "./index.css"
import type React from "react"
import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Navbar from "./components/common/Navbar"
import Dashboard from "./components/Dashboard"
import CardCreator from "./components/CardCreator"
import CardEditor from "./components/CardEditor"
import CardView from "./components/CardView"
import ViewLeads from "./components/ViewLeads"
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import Profile from "./components/auth/Profile"
import "./App.css"
import OAuthCallback from "./components/auth/OAuthCallback"

const App: React.FC = () => {
  // We'll create a ScrollToTop component to handle scroll behavior
  const ScrollToTop = () => {
    const { pathname } = useLocation()

    useEffect(() => {
      window.scrollTo(0, 0)
    }, [pathname])

    return null
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/view-card/:username"
                element={
                  <>
                    {/* No Navbar for CardView */}
                    <CardView />
                  </>
                }
              />
              <Route path="/auth/:provider/callback" element={<OAuthCallback />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <div className="content">
                      <Dashboard />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-card"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <div className="content">
                      <CardCreator />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-card/:username"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <div className="content">
                      <CardEditor />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/view-leads/:username"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <div className="content">
                      <ViewLeads />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <div className="content">
                      <Profile />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App

