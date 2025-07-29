'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { messagesApi } from '../lib/api';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { OnlineUsers } from './OnlineUsers';
import type { Message, TypingIndicator as TypingType, OnlineUser } from '../lib/types';

interface ChatContainerProps {
  bookingId: string;
  currentUser: {
    id: string;
    name: string;
    userType: 'STUDENT' | 'PROVIDER' | 'ADMIN';
  };
}

export function ChatContainer({ bookingId, currentUser }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingType[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>(null);

  // Fetch initial messages
  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['messages', bookingId],
    queryFn: () => messagesApi.getMessages(bookingId, { limit: 50 }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      messagesApi.sendMessage(bookingId, { content }),
    onSuccess: (data) => {
      // Add the message to local state immediately
      const newMessage = data.message;
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      
      // Broadcast the message to other users via Supabase Realtime
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'new_message',
          payload: newMessage,
        });
      }
      
      // Invalidate the query to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['messages', bookingId] });
      
      scrollToBottom();
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    },
  });

  // Realtime callbacks
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(m => m.id === message.id)) return prev;
      return [...prev, message];
    });
    scrollToBottom();
  }, []);

  const handleMessageUpdated = useCallback((message: Message) => {
    setMessages(prev => 
      prev.map(m => m.id === message.id ? message : m)
    );
  }, []);

  const handleMessageDeleted = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  const handleTyping = useCallback((typing: TypingType) => {
    if (typing.userId === currentUser.id) return; // Ignore own typing

    setTypingUsers(prev => {
      const filtered = prev.filter(t => t.userId !== typing.userId);
      if (typing.isTyping) {
        return [...filtered, typing];
      }
      return filtered;
    });

    // Clear typing after 3 seconds
    if (typing.isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(t => t.userId !== typing.userId));
      }, 3000);
    }
  }, [currentUser.id]);

  const handleUserOnline = useCallback((user: OnlineUser) => {
    if (user.userId === currentUser.id) return; // Ignore self

    setOnlineUsers(prev => {
      const filtered = prev.filter(u => u.userId !== user.userId);
      return [...filtered, user];
    });
  }, [currentUser.id]);

  const handleUserOffline = useCallback((userId: string) => {
    setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
  }, []);

  // Setup realtime subscriptions
  const { sendTypingIndicator, sendPresenceUpdate, channel } = useRealtimeMessages(
    bookingId,
    {
      onNewMessage: handleNewMessage,
      onMessageUpdated: handleMessageUpdated,
      onMessageDeleted: handleMessageDeleted,
      onTyping: handleTyping,
      onUserOnline: handleUserOnline,
      onUserOffline: handleUserOffline,
    },
    currentUser
  );

  // Store channel reference
  useEffect(() => {
    channelRef.current = channel;
  }, [channel]);

  // Initialize messages from query
  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages.reverse()); // Reverse for chronological order
    }
  }, [messagesData]);

  // Send presence update when component mounts
  useEffect(() => {
    sendPresenceUpdate({
      userId: currentUser.id,
      name: currentUser.name,
      userType: currentUser.userType,
      lastSeen: new Date().toISOString(),
    });
  }, [currentUser, sendPresenceUpdate]);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle typing indicator
  const handleTypingStart = useCallback(() => {
    sendTypingIndicator(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 3000);
  }, [sendTypingIndicator]);

  const handleTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingIndicator(false);
  }, [sendTypingIndicator]);

  // Handle sending messages
  const handleSendMessage = useCallback((content: string) => {
    if (content.trim()) {
      sendMessageMutation.mutate(content.trim());
      handleTypingStop();
    }
  }, [sendMessageMutation, handleTypingStop]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !messagesData?.pagination.hasNext) return;

    setIsLoadingMore(true);
    try {
      const oldestMessage = messages[0];
      const cursor = oldestMessage?.createdAt;
      
      const moreMessages = await messagesApi.getMessages(bookingId, {
        cursor,
        limit: 50,
      });

      setMessages(prev => [...moreMessages.messages.reverse(), ...prev]);
    } catch (error) {
      toast.error('Failed to load more messages');
    } finally {
      setIsLoadingMore(false);
    }
  }, [bookingId, messages, messagesData?.pagination.hasNext, isLoadingMore]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load messages</p>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['messages', bookingId] })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Header with online users */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <OnlineUsers users={onlineUsers} />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList
          messages={messages}
          currentUserId={currentUser.id}
          onLoadMore={loadMoreMessages}
          isLoadingMore={isLoadingMore}
          hasMore={messagesData?.pagination.hasNext ?? false}
        />
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 border-t bg-gray-50">
            <TypingIndicator users={typingUsers} />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <MessageInput 
          onSendMessage={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          isLoading={sendMessageMutation.isPending}
        />
      </div>
    </div>
  );
}
