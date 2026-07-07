import api from './axios'

export const chatApi = {
  /**
   * Send a chat message to the assistant.
   * @param {string} message - The text content of the message.
   * @param {string|null} conversationId - The ID of the existing conversation, or null if starting a new one.
   * @returns {Promise<object>} The chat response payload (user_message, ai_message, conversation_title)
   */
  sendMessage: async (message, conversationId = null) => {
    try {
      const response = await api.post('/chat', {
        message,
        conversation_id: conversationId,
      })
      return response.data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  },
}
