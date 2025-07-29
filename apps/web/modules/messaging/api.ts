import type {
  Message,
  CreateMessageRequest,
  MessageListResponse,
  MessageResponse,
  MessageCursor,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Send a new message in a booking chat
 */
export async function sendMessage(
  bookingId: string,
  data: CreateMessageRequest,
): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  const result: MessageResponse = await response.json();
  return result.message;
}

/**
 * Fetch messages for a booking with pagination
 */
export async function fetchMessages(
  bookingId: string,
  cursor?: MessageCursor,
  limit: number = 50,
): Promise<MessageListResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  if (cursor) {
    params.append('cursor', JSON.stringify(cursor));
  }

  const response = await fetch(
    `${API_BASE_URL}/bookings/${bookingId}/messages?${params}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch messages');
  }

  return response.json();
}

/**
 * Mark messages as read in a booking
 */
export async function markMessagesAsRead(bookingId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${bookingId}/messages/read`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark messages as read');
  }
}

/**
 * Get unread message count for a booking
 */
export async function getUnreadCount(bookingId: string): Promise<number> {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${bookingId}/messages/unread-count`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get unread count');
  }

  const result = await response.json();
  return result.count;
}
