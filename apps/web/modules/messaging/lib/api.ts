import { apiClient } from '../../shared/lib/api-client';
import type { Message, MessagesResponse, SendMessageRequest } from './types';

export const messagesApi = {
  // Send a message in a booking chat
  sendMessage: async (bookingId: string, data: SendMessageRequest): Promise<{ message: Message }> => {
    const response = await apiClient.messages.bookings[':bookingId'].$post({
      param: { bookingId },
      json: data,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
  },

  // Get messages for a booking
  getMessages: async (
    bookingId: string,
    params?: {
      page?: number;
      limit?: number;
      cursor?: string;
    }
  ): Promise<MessagesResponse> => {
    const response = await apiClient.messages.bookings[':bookingId'].$get({
      param: { bookingId },
      query: params ? {
        page: params.page?.toString(),
        limit: params.limit?.toString(),
        cursor: params.cursor,
      } : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch messages');
    }

    return response.json();
  },

  // Update/edit a message
  updateMessage: async (messageId: string, content: string): Promise<{ message: Message }> => {
    const response = await apiClient.messages[':messageId'].$patch({
      param: { messageId },
      json: { content },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update message');
    }

    return response.json();
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<{ message: string }> => {
    const response = await apiClient.messages[':messageId'].$delete({
      param: { messageId },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete message');
    }

    return response.json();
  },
};
