export interface User {
    _id: string
    username: string
    name?: string
    email?: string
    role: string
    profilePicture?: string
    themePreference?: "light" | "dark"
    created_at?: string
    token?: string
  }
  
  export interface LoginData {
    email: string
    password: string
  }
  
  export interface RegisterData {
    username: string
    password: string
    name?: string
    email?: string
    themePreference?: "light" | "dark"
  }
  
  export interface SocialAuthData {
    provider: string
    token: string
    userData?: any
  }
  
  