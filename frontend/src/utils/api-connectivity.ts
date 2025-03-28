import API from "../services/API"

export const checkApiConnectivity = async (): Promise<boolean> => {
  try {
    // Try to hit a simple endpoint that should always work
    await API.get("/api/auth/test")
    console.log("API connection successful")
    return true
  } catch (error) {
    console.error("API connection failed:", error)
    return false
  }
}

export const initializeApiConnection = async (): Promise<void> => {
  // Check if we have a token in localStorage
  const token = localStorage.getItem("token")

  if (token) {
    // Set the token in the API headers
    API.setAuthToken(token)
    console.log("API token set from localStorage")
  }

  // Check connectivity
  const isConnected = await checkApiConnectivity()

  if (!isConnected) {
    console.warn("Unable to connect to the API. Please check your backend server.")
  }
}

