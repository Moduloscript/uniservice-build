'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  isLoading: boolean;
}

export function MessageInput({ 
  onSendMessage, 
  onTypingStart, 
  onTypingStop, 
  isLoading 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      onTypingStop();
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, isLoading, onSendMessage, onTypingStop]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;

    // Handle typing indicators
    if (value.trim()) {
      onTypingStart();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop();
      }, 3000);
    } else {
      onTypingStop();
    }
  }, [onTypingStart, onTypingStop]);

  const handleBlur = useCallback(() => {
    // Stop typing when input loses focus
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTypingStop();
  }, [onTypingStop]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Type your message..."
          disabled={isLoading}
          className="
            w-full resize-none rounded-lg border border-gray-300 px-3 py-2 pr-10
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            max-h-[120px] min-h-[40px]
          "
          rows={1}
          maxLength={2000}
        />
        
        {/* Character count */}
        {message.length > 1800 && (
          <div className="absolute bottom-1 right-10 text-xs text-gray-500">
            {message.length}/2000
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="
          flex items-center justify-center w-10 h-10 rounded-lg
          bg-blue-600 text-white hover:bg-blue-700
          disabled:bg-gray-300 disabled:cursor-not-allowed
          transition-colors duration-200
        "
        title="Send message (Enter)"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </form>
  );
}
