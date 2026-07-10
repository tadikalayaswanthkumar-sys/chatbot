import axios from 'axios'

// Configure Axios instance pointing to the FastAPI backend API prefix
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

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

export const conversationApi = {
  /**
   * Fetch all user conversations.
   * @returns {Promise<Array>} List of conversation records.
   */
  getConversations: async () => {
    try {
      const response = await api.get('/conversations')
      return response.data
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  },

  /**
   * Fetch details for a specific conversation including its message thread.
   * @param {string} id - The UUID of the conversation.
   * @returns {Promise<object>} Detailed conversation object.
   */
  getConversationDetails: async (id) => {
    try {
      const response = await api.get(`/conversations/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching conversation details:', error)
      throw error
    }
  },

  /**
   * Delete a conversation.
   * @param {string} id - The UUID of the conversation to delete.
   * @returns {Promise<object>} Status result from delete.
   */
  deleteConversation: async (id) => {
    try {
      const response = await api.delete(`/conversations/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  },
}

export default api
