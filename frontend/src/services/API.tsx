import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios"

// Create a base axios instance with common configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080", // Make sure this matches your backend port
  timeout: 30000, // Increased timeout for handling larger image data
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  maxContentLength: 20 * 1024 * 1024, // 20MB max content length for larger payloads
  maxBodyLength: 20 * 1024 * 1024, // Add this for handling larger request bodies
})

// Add response logging for debugging
apiClient.interceptors.response.use(
  (response) => {
    // If the response contains image data, ensure it's properly processed
    if (response.headers["content-type"]?.includes("image/")) {
      return response
    }
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Clear stored auth data
        localStorage.removeItem("user")
        localStorage.removeItem("token")

        // Redirect to login page if not already there
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login"
        }
      }
    }
    return Promise.reject(error)
  },
)

// API service object with methods for common operations
const API = {
  // The base axios instance for custom calls
  client: apiClient,

  // Set auth token for requests
  setAuthToken: (token: string | null) => {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common["Authorization"]
    }
  },

  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.get(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.post(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.put(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default API

