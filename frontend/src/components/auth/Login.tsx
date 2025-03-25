"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login, socialLogin } = useAuth()

  // Check for OAuth callback parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const oauthToken = params.get("token")
    const oauthError = params.get("error")

    if (oauthToken) {
      // Handle successful OAuth login
      localStorage.setItem("token", oauthToken)
      navigate("/")
    } else if (oauthError) {
      setError(oauthError)
    }
  }, [location, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError(null)
    setLoading(true)

    try {
      await login(formData.username, formData.password)
      navigate("/")
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to login. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true)
      setError(null)

      await socialLogin("google", credentialResponse.credential)
      setSuccess("Login successful! Redirecting...")

      setTimeout(() => {
        navigate("/")
      }, 1000)
    } catch (err: any) {
      console.error("Google login error:", err)
      setError(err.response?.data?.error || "Google login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Google login error
  const handleGoogleError = () => {
    setError("Google login failed. Please try again.")
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Background image */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12 relative"
        style={{
          backgroundImage: `url('/images/background.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div>
          <div className="flex space-x-4 mb-16">
            <div className="px-6 py-2 text-white font-medium">LOGIN</div>
            <Link to="/register" className="px-6 py-2 text-white/80 hover:text-white font-medium">
              SIGN UP
            </Link>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
            <p className="text-white/80 text-lg max-w-md">
              Sign in to access your digital business cards and manage your professional identity.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - White background with form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo above the form */}
          <div className="flex justify-center mb-8">
            <img src="/images/logo.png" alt="Identifini Logo" className="w-24 h-24 object-contain" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Login</h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          <div className="text-center mb-8">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or login with</span>
              </div>
            </div>

            <div className="mt-6">
              {/* Google Login Button */}
              <button
                type="button"
                onClick={() => (window.location.href = `${process.env.REACT_APP_API_URL || ""}/api/auth/google`)}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>

          {/* Extra space to match register page height */}
          <div className="h-16"></div>
        </div>
      </div>
    </div>
  )
}

export default Login

