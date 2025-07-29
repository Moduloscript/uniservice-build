// Message types for the communication layer

export type MessageType = 'TEXT' | 'SYSTEM' | 'ATTACHMENT';

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  type: MessageType;
  metadata?: {
    readBy?: string[];
    readAt?: Record<string, string>;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
  };
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string;
    image?: string;
    userType?: 'STUDENT' | 'PROVIDER';
  };
}

export interface CreateMessageRequest {
  content: string;
  type?: MessageType;
}

export interface MessageListResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface MessageResponse {
  message: Message;
}

// Realtime payload types
export interface RealtimeMessagePayload {
  type: 'broadcast';
  event: 'new_message';
  payload: {
    message: Message;
    bookingId: string;
  };
}

export interface TypingPayload {
  type: 'broadcast';
  event: 'typing';
  payload: {
    userId: string;
    userName: string;
    isTyping: boolean;
    bookingId: string;
  };
}

// Presence state for online status
export interface PresenceState {
  userId: string;
  userName: string;
  userType: 'STUDENT' | 'PROVIDER';
  online_at: string;
}

// Chat hook return type
export interface ChatHookReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  typingUsers: string[];
  onlineUsers: PresenceState[];
  markAsRead: () => void;
}

// Message pagination cursor
export interface MessageCursor {
  id: string;
  createdAt: string;
}
