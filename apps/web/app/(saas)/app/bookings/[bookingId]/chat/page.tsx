import { auth } from '@repo/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ChatPageClient } from './chat-page-client';

interface BookingChatPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default async function BookingChatPage({ params }: BookingChatPageProps) {
  const { bookingId } = await params;
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  
  if (!session) {
    redirect('/auth/signin');
  }

  const { user } = session;

  return (
    <ChatPageClient
      bookingId={bookingId}
      currentUser={{
        id: user.id,
        name: user.name,
        userType: user.userType as 'STUDENT' | 'PROVIDER' | 'ADMIN',
      }}
    />
  );
}

export async function generateMetadata({ params }: BookingChatPageProps) {
  const { bookingId } = await params;
  return {
    title: `Chat - Booking ${bookingId}`,
    description: 'Chat with your booking participant',
  };
}
