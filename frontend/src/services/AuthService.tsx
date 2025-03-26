import API from "./API"

interface RegisterData {
  username: string
  password: string
  name?: string
  email?: string
}

interface LoginData {
  email: string
  password: string
}

// Define the User interface to match what's in AuthContext
interface User {
  _id: string
  username: string
  name?: string
  email?: string
  role: string
  profilePicture?: string
  created_at?: string
  token?: string
}

interface SocialAuthData {
  provider: string
  token: string
  userData?: {
    name?: string
    email?: string
    profilePicture?: string
  }
}

// Define the AuthService object with all methods
const AuthService = {
  // Register a new user
  register: async (data: RegisterData): Promise<User> => {
    const response = await API.post<User>("/api/auth/register", data)
    return response
  },

  // Login user
  login: async (data: LoginData): Promise<User> => {
    try {
      // Check if we should use username or email for login
      const loginData = {
        // Support both email and username login
        ...(data.email.includes("@") ? { email: data.email } : { username: data.email }),
        password: data.password,
      }

      const response = await API.post<User>("/api/auth/login", loginData)
      return response
    } catch (error) {
      console.error("Login error in AuthService:", error)
      throw error
    }
  },

  // Social login (Google)
  socialLogin: async (data: SocialAuthData): Promise<User> => {
    try {
      const response = await API.post<User>("/api/auth/social-login", data)
      return response
    } catch (error) {
      console.error("Social login error in AuthService:", error)
      throw error
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    return API.get<User>("/api/auth/me")
  },

  // Set auth token in local storage
  setToken: (token: string): void => {
    localStorage.setItem("token", token)
  },

  // Get auth token from local storage
  getToken: (): string | null => {
    return localStorage.getItem("token")
  },

  // Remove auth token from local storage
  removeToken: (): void => {
    localStorage.removeItem("token")
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token")
  },

  // Get OAuth URL for Google
  getGoogleAuthUrl: (): string => {
    return `${API.client.defaults.baseURL}/api/auth/google`
  },
}

export default AuthService

