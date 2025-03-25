"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"

const ApiDebugger: React.FC = () => {
  const [pingResult, setPingResult] = useState<string>("")
  const [cardsResult, setCardsResult] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [port, setPort] = useState<string>("8080")

  const testPingApi = async () => {
    setLoading(true)
    setPingResult("")
    try {
      const response = await fetch(`http://localhost:${port}/api/ping`)
      const data = await response.json()
      setPingResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setPingResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testCardsApi = async () => {
    setLoading(true)
    setCardsResult("")
    try {
      const response = await fetch(`http://localhost:${port}/api/cards`)
      const data = await response.json()
      setCardsResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setCardsResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testCardsTestApi = async () => {
    setLoading(true)
    setCardsResult("")
    try {
      const response = await fetch(`http://localhost:${port}/api/cards-test`)
      const data = await response.json()
      setCardsResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setCardsResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>API Debugger</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Port Configuration</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <label htmlFor="port">Backend Port:</label>
          <input
            id="port"
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            style={{ padding: "5px", width: "80px" }}
          />
          <span style={{ fontSize: "14px", color: "#666" }}>
            (Default is 8080, but your backend might be on a different port)
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Test Ping Endpoint</h2>
        <button onClick={testPingApi} disabled={loading} style={{ padding: "8px 16px", marginRight: "10px" }}>
          Test Ping API
        </button>
        {pingResult && (
          <pre
            style={{ marginTop: "10px", padding: "10px", background: "#f5f5f5", borderRadius: "4px", overflow: "auto" }}
          >
            {pingResult}
          </pre>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Test Cards Endpoint</h2>
        <button onClick={testCardsApi} disabled={loading} style={{ padding: "8px 16px", marginRight: "10px" }}>
          Test Cards API
        </button>
        <button onClick={testCardsTestApi} disabled={loading} style={{ padding: "8px 16px" }}>
          Test Cards-Test API
        </button>
        {cardsResult && (
          <pre
            style={{ marginTop: "10px", padding: "10px", background: "#f5f5f5", borderRadius: "4px", overflow: "auto" }}
          >
            {cardsResult}
          </pre>
        )}
      </div>

      <div style={{ marginTop: "30px" }}>
        <Link to="/" style={{ color: "blue" }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default ApiDebugger

