'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../lib/types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
}

export function MessageList({ 
  messages, 
  currentUserId, 
  onLoadMore, 
  isLoadingMore, 
  hasMore 
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Handle scroll to top for loading more messages
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop } = scrollRef.current;
    
    // Load more when user scrolls near the top
    if (scrollTop < 100) {
      onLoadMore();
    }
  }, [onLoadMore, isLoadingMore, hasMore]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div ref={topRef} />
      
      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Loading more messages...</span>
          </div>
        </div>
      )}

      {/* Messages grouped by date */}
      {Object.entries(groupedMessages).map(([dateString, dateMessages]) => (
        <div key={dateString} className="space-y-2">
          {/* Date header */}
          <div className="flex justify-center my-4">
            <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
              {formatDateHeader(dateString)}
            </div>
          </div>

          {/* Messages for this date */}
          {dateMessages.map((message, index) => {
            const previousMessage = index > 0 ? dateMessages[index - 1] : null;
            const nextMessage = index < dateMessages.length - 1 ? dateMessages[index + 1] : null;
            
            const isConsecutive = previousMessage && 
              previousMessage.senderId === message.senderId &&
              new Date(message.createdAt).getTime() - new Date(previousMessage.createdAt).getTime() < 300000; // 5 minutes

            const isLastInGroup = !nextMessage || 
              nextMessage.senderId !== message.senderId ||
              new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() > 300000; // 5 minutes

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                showAvatar={!isConsecutive}
                showTimestamp={isLastInGroup}
                isConsecutive={isConsecutive}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
