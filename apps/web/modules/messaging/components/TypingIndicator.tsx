'use client';

import React from 'react';
import type { TypingIndicator as TypingType } from '../lib/types';

interface TypingIndicatorProps {
  users: TypingType[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const typingUsers = users.filter(user => user.isTyping);
  
  if (typingUsers.length === 0) return null;

  const formatTypingText = () => {
    if (typingUsers.length === 1) {
      return `Someone is typing...`;
    } else if (typingUsers.length === 2) {
      return `2 people are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-gray-500 text-sm">
      {/* Animated typing dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      
      <span className="italic">
        {formatTypingText()}
      </span>
    </div>
  );
}
