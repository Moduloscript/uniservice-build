'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Message } from '../lib/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  isConsecutive: boolean;
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar, 
  showTimestamp, 
  isConsecutive 
}: MessageBubbleProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'PROVIDER':
        return 'bg-green-500';
      case 'STUDENT':
        return 'bg-blue-500';
      case 'ADMIN':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`flex items-end space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar (left side for others) */}
      {!isOwn && (
        <div className="flex-shrink-0 w-8 h-8">
          {showAvatar ? (
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getUserTypeColor(message.sender.userType)}`}
              title={`${message.sender.name} (${message.sender.userType})`}
            >
              {getInitials(message.sender.name)}
            </div>
          ) : (
            <div className="w-8 h-8" /> // Spacer
          )}
        </div>
      )}

      {/* Message content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs sm:max-w-md`}>
        {/* Sender name (only for others, not consecutive) */}
        {!isOwn && showAvatar && (
          <div className="text-xs text-gray-500 mb-1 px-2">
            {message.sender.name}
            <span className="ml-1 text-xs px-1.5 py-0.5 bg-gray-100 rounded-full">
              {message.sender.userType.toLowerCase()}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            px-3 py-2 rounded-lg max-w-full break-words
            ${isOwn 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-900'
            }
            ${isConsecutive && isOwn ? 'rounded-br-sm' : ''}
            ${isConsecutive && !isOwn ? 'rounded-bl-sm' : ''}
          `}
        >
          {/* System messages */}
          {message.type === 'SYSTEM' ? (
            <div className="text-center text-sm italic">
              {message.content}
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div className={`text-xs text-gray-500 mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.createdAt)}
            {message.updatedAt !== message.createdAt && (
              <span className="ml-1 italic">(edited)</span>
            )}
          </div>
        )}
      </div>

      {/* Avatar (right side for own messages) */}
      {isOwn && (
        <div className="flex-shrink-0 w-8 h-8">
          {showAvatar ? (
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
              You
            </div>
          ) : (
            <div className="w-8 h-8" /> // Spacer
          )}
        </div>
      )}
    </div>
  );
}
