export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  type: MessageType;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    userType: UserType;
  };
}

export type MessageType = 'TEXT' | 'SYSTEM' | 'ATTACHMENT';
export type UserType = 'STUDENT' | 'PROVIDER' | 'ADMIN';

export interface SendMessageRequest {
  content: string;
  type?: MessageType;
  metadata?: Record<string, any>;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
  };
}

export interface TypingIndicator {
  userId: string;
  bookingId: string;
  isTyping: boolean;
  timestamp: number;
}

export interface OnlineUser {
  userId: string;
  name: string;
  userType: UserType;
  lastSeen: string;
}

export interface RealtimePayload {
  event: 'new_message' | 'message_updated' | 'message_deleted' | 'typing' | 'user_online' | 'user_offline';
  payload: Message | TypingIndicator | OnlineUser | { messageId: string };
}
