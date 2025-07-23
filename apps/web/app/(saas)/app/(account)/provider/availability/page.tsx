'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components/card';
import { Button } from '@ui/components/button';
import { Calendar, Clock, Plus, Trash2, Save, X, Edit, Copy, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerAvailabilityApi, providerAvailabilityQueryKeys } from '@/modules/provider/api';
import { AvailabilityCalendar } from '@/modules/availability/components/availability-calendar';
import { ProviderAvailabilityManager } from './components/ProviderAvailabilityManager';
import { useProviderAuth } from '../hooks/useProviderAuth';

export default function AvailabilityPage() {
  const { user, isLoading: isUserLoading } = useProviderAuth();
  const queryClient = useQueryClient();

  const { data: availabilityData, isLoading: isAvailabilityLoading } = useQuery({
    queryKey: providerAvailabilityQueryKeys.byProvider(user?.id),
    queryFn: () => (user ? providerAvailabilityApi.getAvailability(user.id) : Promise.resolve({ data: [] })),
    enabled: !!user
  });

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your availability...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You need to be logged in as a provider to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage Availability</CardTitle>
            <CardDescription>Set your schedule, manage bookings, and define your availability for students.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderAvailabilityManager providerId={user.id} />
            <div className="mt-8">
              <h3 className="text-lg font-medium">Your Calendar</h3>
              <AvailabilityCalendar providerId={user.id} readonly={false} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

