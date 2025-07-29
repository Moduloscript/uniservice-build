'use client';

import { ChatContainer } from '@/modules/messaging';

interface ChatPageClientProps {
  bookingId: string;
  currentUser: {
    id: string;
    name: string;
    userType: 'STUDENT' | 'PROVIDER' | 'ADMIN';
  };
}

export function ChatPageClient({ bookingId, currentUser }: ChatPageClientProps) {
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Booking Chat
        </h1>
        <p className="text-gray-600 mt-1">
          Communicate with your {currentUser.userType === 'STUDENT' ? 'provider' : 'student'} about this booking
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border h-[600px]">
        <ChatContainer
          bookingId={bookingId}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
