import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Message, TypingIndicator, OnlineUser } from '../lib/types';

interface RealtimeMessagesCallbacks {
  onNewMessage?: (message: Message) => void;
  onMessageUpdated?: (message: Message) => void;
  onMessageDeleted?: (messageId: string) => void;
  onTyping?: (typing: TypingIndicator) => void;
  onUserOnline?: (user: OnlineUser) => void;
  onUserOffline?: (userId: string) => void;
}

export function useRealtimeMessages(
  bookingId: string,
  callbacks: RealtimeMessagesCallbacks,
  currentUser?: { id: string; name: string; userType: string }
) {
  const channelRef = useRef<any>(null);
  const { onNewMessage, onMessageUpdated, onMessageDeleted, onTyping, onUserOnline, onUserOffline } = callbacks;

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (channelRef.current && currentUser) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          bookingId,
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping,
          timestamp: Date.now(),
        },
      });
    }
  }, [bookingId, currentUser]);

  const sendPresenceUpdate = useCallback((user: OnlineUser) => {
    if (channelRef.current) {
      channelRef.current.track(user);
    }
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`booking-chat:${bookingId}`)
      // Listen for new messages
      .on('broadcast', { event: 'new_message' }, (payload) => {
        if (onNewMessage) {
          onNewMessage(payload.payload as Message);
        }
      })
      // Listen for message updates
      .on('broadcast', { event: 'message_updated' }, (payload) => {
        if (onMessageUpdated) {
          onMessageUpdated(payload.payload as Message);
        }
      })
      // Listen for message deletions
      .on('broadcast', { event: 'message_deleted' }, (payload) => {
        if (onMessageDeleted) {
          onMessageDeleted((payload.payload as { messageId: string }).messageId);
        }
      })
      // Listen for typing indicators
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (onTyping) {
          onTyping(payload.payload as TypingIndicator);
        }
      })
      // Listen for presence changes (online/offline users)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.keys(newState).map(userId => newState[userId][0] as OnlineUser);
        
        users.forEach(user => {
          if (onUserOnline) {
            onUserOnline(user);
          }
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const user = newPresences[0] as OnlineUser;
        if (onUserOnline) {
          onUserOnline(user);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const user = leftPresences[0] as OnlineUser;
        if (onUserOffline) {
          onUserOffline(user.userId);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to booking-chat:${bookingId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Failed to subscribe to booking-chat:${bookingId}`);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [bookingId, onNewMessage, onMessageUpdated, onMessageDeleted, onTyping, onUserOnline, onUserOffline]);

  return {
    sendTypingIndicator,
    sendPresenceUpdate,
    channel: channelRef.current,
  };
}

