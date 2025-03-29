//card.ts
export interface Card {
  _id?: string
  id?: string
  card_username: string
  display_name: string
  phone?: string
  tagline?: string
  bio?: string
  card_pic?: string
  display_address?: string
  theme_color_1?: string
  theme_color_2?: string
  theme_color_3?: string
  social_medias?: Array<{
    platform: string
    url: string
    icon?: string
  }>
  action_buttons?: Array<{
    label: string
    url: string
    icon?: string
  }>
  floating_actions?: Array<{
    type: string
    url: string
    icon?: string
  }>
  wifi_config?: string
  latitude?: string
  longitude?: string
  custom_map_link?: string
  card_email?: string
  card_wifi_ssid?: string
  card_wifi_password?: string
  extra_photos?: Array<string>
  // New fields for subscription package support
  package_type?: "individual" | "restaurant" | "enterprise"
  cover_picture?: string
  business_hours?: string
  // Sub-models
  individual_details?: {
    birthday?: string
    hometown?: string
    current_city?: string
    relationship_status?: string
    job_title?: string
    interests?: string[]
    resume?: {
      education?: string
      experience?: string
      skills?: string[]
      certifications?: string[]
    }
  }
  restaurant_details?: {
    speciality?: string
    amenities?: string[]
    events?: string[]
    menu?: string // ObjectId reference
  }
  enterprise_details?: {
    company_details?: {
      founded_time?: string
      headquarters?: string
      employees_number?: number
    }
    industries_served?: string[]
    services?: string[]
    certifications?: string[]
    clients?: string[]
  }
  user?: string
  created_at?: string
  isDeleted?: boolean
  deletedAt?: string
}

export interface MenuItem {
  _id?: string
  name: string
  description?: string
  price: number
  image?: string
  category?: string
  isAvailable?: boolean
}

export interface Menu {
  _id?: string
  card?: string
  title: string
  description?: string
  items?: MenuItem[]
  isActive?: boolean
  displayOrder?: number
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
  deletedAt?: string
}

export interface Lead {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  notes?: string
  cardUsername: string
  createdAt: string
}

export interface CardListResponse {
  cards: Card[]
  total?: number
}

export interface MenuListResponse {
  menus: Menu[]
  total?: number
}

