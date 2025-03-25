import type React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Navbar from "./components/common/Navbar"
import Dashboard from "./components/Dashboard"
import CardCreator from "./components/CardCreator"
import CardEditor from "./components/CardEditor"
import CardView from "./components/CardView"
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import Profile from "./components/auth/Profile"
import "./App.css"

const App: React.FC = () => {
  console.log("App component rendering")

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="content">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/view-card/:username" element={<CardView />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-card"
                element={
                  <ProtectedRoute>
                    <CardCreator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-card/:username"
                element={
                  <ProtectedRoute>
                    <CardEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

