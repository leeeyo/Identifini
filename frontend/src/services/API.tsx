import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios"

// Create a base axios instance with common configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080", // Make sure this matches your backend port
  timeout: 15000, // Increased timeout for debugging
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Add request logging for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`, config)
    return config
  },
  (error) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response logging for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} from ${response.config.url}`, response.data)
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error(`❌ Response Error: ${error.response.status} from ${error.config?.url}`, error.response.data)
    } else if (error.request) {
      console.error("❌ No Response Received:", error.request)
    } else {
      console.error("❌ Request Setup Error:", error.message)
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
      console.log(`Making GET request to: ${url}`)
      const response: AxiosResponse<T> = await apiClient.get(url, config)
      return response.data
    } catch (error) {
      console.error(`GET request to ${url} failed:`, error)
      throw error
    }
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      console.log(`Making POST request to: ${url}`)
      const response: AxiosResponse<T> = await apiClient.post(url, data, config)
      return response.data
    } catch (error) {
      console.error(`POST request to ${url} failed:`, error)
      throw error
    }
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      console.log(`Making PUT request to: ${url}`)
      const response: AxiosResponse<T> = await apiClient.put(url, data, config)
      return response.data
    } catch (error) {
      console.error(`PUT request to ${url} failed:`, error)
      throw error
    }
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      console.log(`Making DELETE request to: ${url}`)
      const response: AxiosResponse<T> = await apiClient.delete(url, config)
      return response.data
    } catch (error) {
      console.error(`DELETE request to ${url} failed:`, error)
      throw error
    }
  },
}

export default API

