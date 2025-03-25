import API from "./API"
import type { Card } from "../types/card"

// Define response types
interface CardListResponse {
  cards: Card[]
  total?: number
}

const CardService = {
  // Get all cards with pagination
  getAllCards: async (page = 1, limit = 10): Promise<CardListResponse> => {
    try {
      console.log(`Trying to fetch cards from /api/cards?page=${page}&limit=${limit}`)
      return await API.get<CardListResponse>(`/api/cards?page=${page}&limit=${limit}`)
    } catch (error) {
      console.error("Regular endpoint failed, trying test endpoint")

      // If that fails, try the test endpoint
      try {
        console.log("Trying to fetch cards from /api/cards-test")
        const testResponse = await API.get<any>("/api/cards-test")
        console.log("Test endpoint response:", testResponse)
        return {
          cards: testResponse.cards || [],
          total: testResponse.cards?.length || 0,
        }
      } catch (testError) {
        console.error("Both endpoints failed")
        throw error // Throw the original error
      }
    }
  },

  // Get a card by ID
  getCardById: async (id: string): Promise<Card> => {
    return API.get<Card>(`/api/cards/${id}`)
  },

  // Get a card by username
  getCardByUsername: async (username: string): Promise<Card> => {
    return API.get<Card>(`/api/cards/username/${username}`)
  },

  // Create a new card
  createCard: async (cardData: Partial<Card>): Promise<Card> => {
    return API.post<Card>("/api/cards", cardData)
  },

  // Update a card
  updateCard: async (id: string, cardData: Partial<Card>): Promise<Card> => {
    return API.put<Card>(`/api/cards/${id}`, cardData)
  },

  // Delete a card
  deleteCard: async (id: string): Promise<void> => {
    return API.delete<void>(`/api/cards/${id}`)
  },

  // Duplicate a card
  duplicateCard: async (id: string): Promise<Card> => {
    return API.post<Card>(`/api/cards/${id}/duplicate`)
  },

  // Get leads for a card
  getCardLeads: async (cardId: string): Promise<any[]> => {
    return API.get<any[]>(`/api/cards/${cardId}/leads`)
  },

  // Submit lead for a card
  submitLead: async (cardUsername: string, leadData: any): Promise<any> => {
    return API.post<any>(`/api/cards/username/${cardUsername}/leads`, leadData)
  },
}

export default CardService

