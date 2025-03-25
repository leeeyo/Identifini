export interface Card {
    _id?: string
    id?: string
    card_username: string
    display_name: string
    bio?: string
    card_pic?: string
    display_address?: string
    theme_color_1?: string
    theme_color_2?: string
    theme_color_3?: string
    social_medias?: Array<{
      platform: string
      url: string
    }>
    action_buttons?: Array<{
      label: string
      url: string
    }>
    floating_actions?: Array<{
      icon: string
      url: string
    }>
    wifi_config?: string
    latitude?: string
    longitude?: string
    custom_map_link?: string
    card_email?: string
    card_wifi_ssid?: string
    card_wifi_password?: string
    extra_photos?: Array<{
      url: string
    }>
    user?: string
    created_by?: string
    created_at: string
  }
  
  