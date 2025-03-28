import API from "./API"

interface ViewStats {
  total: number
  daily: Array<{ date: string; count: number }>
  weekly: Array<{ week: string; count: number }>
  monthly: Array<{ month: string; count: number }>
}

interface InteractionStats {
  total: number
  byType: Record<string, number>
  daily: Array<{ date: string; count: number }>
}

interface CardAnalytics {
  views: ViewStats
  interactions: InteractionStats
}

const AnalyticsService = {
  // Record a card view (public)
  recordCardView: async (cardId: string): Promise<void> => {
    try {
      await API.post<void>(`/api/analytics/cards/${cardId}/view`)
    } catch (error) {
      console.error("Error recording card view:", error)
    }
  },

  // Record a card interaction (public)
  recordCardInteraction: async (cardId: string, interactionType: string): Promise<void> => {
    try {
      await API.post<void>(`/api/analytics/cards/${cardId}/interaction`, { type: interactionType })
    } catch (error) {
      console.error("Error recording card interaction:", error)
    }
  },

  // Get card analytics (protected)
  getCardAnalytics: async (cardId: string): Promise<CardAnalytics> => {
    try {
      return await API.get<CardAnalytics>(`/api/analytics/cards/${cardId}`)
    } catch (error) {
      console.error("Error fetching card analytics:", error)
      throw error
    }
  },

  // Get card view stats (protected)
  getCardViewStats: async (cardId: string, period?: string): Promise<ViewStats> => {
    try {
      const url = period
        ? `/api/analytics/cards/${cardId}/views?period=${period}`
        : `/api/analytics/cards/${cardId}/views`
      return await API.get<ViewStats>(url)
    } catch (error) {
      console.error("Error fetching card view stats:", error)
      throw error
    }
  },

  // Get card interaction stats (protected)
  getCardInteractionStats: async (cardId: string, period?: string): Promise<InteractionStats> => {
    try {
      const url = period
        ? `/api/analytics/cards/${cardId}/interactions?period=${period}`
        : `/api/analytics/cards/${cardId}/interactions`
      return await API.get<InteractionStats>(url)
    } catch (error) {
      console.error("Error fetching card interaction stats:", error)
      throw error
    }
  },
}

export default AnalyticsService

