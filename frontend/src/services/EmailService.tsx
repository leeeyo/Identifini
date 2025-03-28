import API from "./API"

interface EmailShareData {
  recipientEmail: string
  recipientName?: string
  message?: string
}

const EmailService = {
  // Share a card via email
  shareCardViaEmail: async (
    cardId: string,
    shareData: EmailShareData,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      return await API.post<{ success: boolean; message: string }>(`/api/email/share-card/${cardId}`, shareData)
    } catch (error) {
      console.error("Error sharing card via email:", error)
      throw error
    }
  },

  // Send a test email
  sendTestEmail: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await API.post<{ success: boolean; message: string }>(`/api/email/test`, { email })
    } catch (error) {
      console.error("Error sending test email:", error)
      throw error
    }
  },
}

export default EmailService

