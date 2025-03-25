"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import CardService from "../services/CardService"
import { useAuth } from "../context/AuthContext"
import "./ViewLeads.css"

interface Lead {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  notes?: string
  cardUsername: string
  createdAt: string
}

const ViewLeads: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    const fetchLeads = async () => {
      if (!username) return

      try {
        setLoading(true)
        const response = await CardService.getCardLeads(username)
        setLeads(response)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching leads:", err)
        setError("Failed to load leads. Please try again later.")
        setLoading(false)
      }
    }

    fetchLeads()
  }, [username])

  const handleExportCSV = () => {
    if (leads.length === 0) return

    // Create CSV content
    const headers = ["First Name", "Last Name", "Email", "Phone", "Notes", "Date"]
    const csvContent = [
      headers.join(","),
      ...leads.map((lead) =>
        [
          `"${lead.firstName}"`,
          `"${lead.lastName}"`,
          `"${lead.email}"`,
          `"${lead.phone}"`,
          `"${lead.notes?.replace(/"/g, '""') || ""}"`,
          `"${new Date(lead.createdAt).toLocaleDateString()}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `leads-${username}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return

    try {
      await CardService.deleteLead(username || "", id)
      setLeads(leads.filter((lead) => lead._id !== id))
      if (selectedLead?._id === id) {
        setSelectedLead(null)
        setShowModal(false)
      }
    } catch (err) {
      console.error("Error deleting lead:", err)
      alert("Failed to delete lead. Please try again.")
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      lead.firstName.toLowerCase().includes(searchTermLower) ||
      lead.lastName.toLowerCase().includes(searchTermLower) ||
      lead.email.toLowerCase().includes(searchTermLower) ||
      lead.phone.includes(searchTerm)
    )
  })

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    }
  })

  const toggleSort = (field: "date" | "name") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  if (loading) {
    return (
      <div className="leads-container">
        <div className="loading-spinner"></div>
        <p>Loading leads...</p>
      </div>
    )
  }

  return (
    <div className="leads-container">
      <div className="leads-header">
        <h1>Leads for {username}</h1>
        <div className="leads-actions">
          <Link to="/" className="back-button">
            Back to Dashboard
          </Link>
          <button className="export-button" onClick={handleExportCSV} disabled={leads.length === 0}>
            Export to CSV
          </button>
        </div>
      </div>

      <div className="leads-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sort-controls">
          <span>Sort by:</span>
          <button className={`sort-button ${sortBy === "date" ? "active" : ""}`} onClick={() => toggleSort("date")}>
            Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button className={`sort-button ${sortBy === "name" ? "active" : ""}`} onClick={() => toggleSort("name")}>
            Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {leads.length === 0 ? (
        <div className="empty-state">
          <h3>No leads available</h3>
          <p>You haven't received any leads for this card yet.</p>
        </div>
      ) : (
        <>
          <div className="leads-count">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
          <div className="leads-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td>
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                    </td>
                    <td>
                      <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="view-button"
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowModal(true)
                        }}
                      >
                        View
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteLead(lead._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Lead Detail Modal */}
      {showModal && selectedLead && (
        <div className="lead-modal">
          <div className="lead-modal-content">
            <button className="close-button" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <h2>Lead Details</h2>
            <div className="lead-details">
              <div className="detail-row">
                <span className="detail-label">First Name:</span>
                <span className="detail-value">{selectedLead.firstName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Name:</span>
                <span className="detail-value">{selectedLead.lastName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  <a href={`mailto:${selectedLead.email}`}>{selectedLead.email}</a>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">
                  <a href={`tel:${selectedLead.phone}`}>{selectedLead.phone}</a>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{new Date(selectedLead.createdAt).toLocaleString()}</span>
              </div>
              {selectedLead.notes && (
                <div className="detail-row notes">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{selectedLead.notes}</span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="delete-button" onClick={() => handleDeleteLead(selectedLead._id)}>
                Delete Lead
              </button>
              <button className="close-modal-button" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewLeads

