"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const OAuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { socialLogin } = useAuth()

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Parse the URL parameters
        const params = new URLSearchParams(location.search)
        const provider = params.get("provider")
        const token = params.get("token")
        const error = params.get("error")

        if (error) {
          setError(decodeURIComponent(error))
          setLoading(false)
          return
        }

        if (!provider || !token) {
          setError("Invalid callback parameters")
          setLoading(false)
          return
        }

        // Process the token based on the provider
        if (provider === "google" || provider === "facebook") {
          await socialLogin(provider as "google" | "facebook", token)
          navigate("/")
        } else {
          setError("Unsupported provider")
        }
      } catch (err: any) {
        console.error("OAuth callback error:", err)
        setError(err.message || "Authentication failed")
      } finally {
        setLoading(false)
      }
    }

    processOAuthCallback()
  }, [location, navigate, socialLogin])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Processing your login...</h2>
        <p className="text-gray-600">Please wait while we complete the authentication.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 max-w-md w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Login
        </button>
      </div>
    )
  }

  return null
}

export default OAuthCallback

