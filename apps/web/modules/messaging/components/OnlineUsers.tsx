'use client';

import React from 'react';
import { Users, Circle } from 'lucide-react';
import type { OnlineUser } from '../lib/types';

interface OnlineUsersProps {
  users: OnlineUser[];
}

export function OnlineUsers({ users }: OnlineUsersProps) {
  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'PROVIDER':
        return 'text-green-500';
      case 'STUDENT':
        return 'text-blue-500';
      case 'ADMIN':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (users.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Users className="w-4 h-4" />
        <span className="text-sm">No one else is online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1 text-gray-600">
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">Online ({users.length})</span>
      </div>
      
      <div className="flex items-center space-x-2">
        {users.slice(0, 3).map((user) => (
          <div key={user.userId} className="flex items-center space-x-1">
            <div className="relative">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                {getInitials(user.name)}
              </div>
              <Circle 
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-current ${getUserTypeColor(user.userType)}`}
              />
            </div>
            <span className="text-xs text-gray-600 hidden sm:inline">
              {user.name.split(' ')[0]}
            </span>
          </div>
        ))}
        
        {users.length > 3 && (
          <div className="text-xs text-gray-500">
            +{users.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}
