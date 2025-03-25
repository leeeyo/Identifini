"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
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

const App: React.FC = () => {
  console.log("App component rendering")
  const [scrolled, setScrolled] = useState(false)

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
      <Router>
        <ScrollToTop />
        <div className="App">
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
    </AuthProvider>
  )
}

export default App

