import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./components/Dashboard"
import CreateCard from "./components/CreateCard"
import EditCard from "./components/EditCard"
import CardView from "./components/CardView"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-card" element={<CreateCard />} />
          <Route path="/edit-card/:username" element={<EditCard />} />
          <Route path="/view-card/:username" element={<CardView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

