'use client';

import React, { useState } from 'react';
import { Button } from '@ui/components/button';
import { Input } from '@ui/components/input';
import { Textarea } from '@ui/components/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  providerAvailabilityApi, 
  providerAvailabilityQueryKeys,
  type CreateAvailabilitySlot,
  type UpdateAvailabilitySlot,
  type BulkCreateAvailabilitySlots,
  type RecurringSchedule,
  type ProviderAvailabilitySlot
} from '@/modules/provider/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/components/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/components/select';
import { Label } from '@ui/components/label';
import { Badge } from '@ui/components/badge';
import { Switch } from '@ui/components/switch';
import { Calendar, Clock, Trash2, Edit, Plus, CalendarPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@ui/components/alert';
import { Separator } from '@ui/components/separator';
import { format, parseISO, addWeeks, startOfWeek, addDays } from 'date-fns';

// Define component
export function ProviderAvailabilityManager({ providerId }: { providerId: string }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('single');
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Single slot state
  const [newSlot, setNewSlot] = useState<CreateAvailabilitySlot>({
    date: '',
    startTime: '',
    endTime: '',
    maxBookings: 1,
    notes: '',
  });
  
  // Bulk slots state
  const [bulkSlots, setBulkSlots] = useState<CreateAvailabilitySlot[]>([
    { date: '', startTime: '', endTime: '', maxBookings: 1 }
  ]);
  
  // Recurring schedule state
  const [recurringSchedule, setRecurringSchedule] = useState<RecurringSchedule & { weeksAhead: number }>({
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    maxBookings: 1,
    notes: '',
    weeksAhead: 4
  });

  // Query existing availability data
  const { data: availabilityResponse, refetch } = useQuery({
    queryKey: ['providerAvailability', providerId],
    queryFn: () => providerAvailabilityApi.getAvailability(providerId)
  });

  // Extract the actual availability data from the response
  const availability = availabilityResponse?.data || [];

  // Mutation to create a new slot
  const createSlotMutation = useMutation({
    mutationFn: (newSlot: CreateAvailabilitySlot) => providerAvailabilityApi.createSlot(providerId, newSlot),
    onSuccess: () => {
      refetch(); // Refresh data after successful creation
      setSuccess('Availability slot created successfully!');
      setError(null);
      // Reset form
      setNewSlot({
        date: '',
        startTime: '',
        endTime: '',
        maxBookings: 1,
        notes: '',
      });
    },
    onError: (error) => {
      console.error('Error creating slot:', error);
      setError(error instanceof Error ? error.message : 'Failed to create slot');
      setSuccess(null);
    }
  });

  // Edit slot mutation
  const editSlotMutation = useMutation({
    mutationFn: ({ availabilityId, updateData }: { availabilityId: string; updateData: UpdateAvailabilitySlot }) =>
      providerAvailabilityApi.updateSlot(providerId, availabilityId, updateData),
    onSuccess: () => {
      refetch(); // Refresh data after successful edit
    },
    onError: (error) => {
      console.error('Error editing slot:', error);
    }
  });

  // Delete slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: (availabilityId: string) => providerAvailabilityApi.deleteSlot(providerId, availabilityId),
    onSuccess: () => {
      refetch(); // Refresh data after successful deletion
    },
    onError: (error) => {
      console.error('Error deleting slot:', error);
    }
  });

  // Bulk create slots mutation
  const bulkCreateSlotsMutation = useMutation({
    mutationFn: (bulkData: BulkCreateAvailabilitySlots) => providerAvailabilityApi.createBulkSlots(providerId, bulkData),
    onSuccess: () => {
      refetch(); // Refresh data after successful bulk creation
    },
    onError: (error) => {
      console.error('Error in bulk creating slots:', error);
    }
  });

  // Recurring schedule mutation
  const recurringScheduleMutation = useMutation({
    mutationFn: ({ schedule, weeksAhead }: { schedule: RecurringSchedule; weeksAhead: number }) =>
      providerAvailabilityApi.createRecurringSchedule(providerId, schedule, weeksAhead),
    onSuccess: () => {
      refetch(); // Refresh data after successful recurring schedule
    },
    onError: (error) => {
      console.error('Error creating recurring schedule:', error);
    }
  });

  const validateNewSlot = (slot: CreateAvailabilitySlot) => {
    if (!slot.date || !slot.startTime || !slot.endTime) {
      setError('Date, start time, and end time are required.');
      return false;
    }
    if (new Date(slot.date + 'T' + slot.endTime) <= new Date(slot.date + 'T' + slot.startTime)) {
      setError('End time must be after start time.');
      return false;
    }
    setError(null);
    return true;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? Number(value) : value;
    setNewSlot((prev) => ({ ...prev, [name]: processedValue }));
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateNewSlot(newSlot)) {
      createSlotMutation.mutate(newSlot);
    }
  };

  // Sample handle for edit slot
  const handleEditSlot = (availabilityId: string, updateData: UpdateAvailabilitySlot) => {
    editSlotMutation.mutate({ availabilityId, updateData });
  };

  // Sample handle for delete slot
  const handleDeleteSlot = (availabilityId: string) => {
    deleteSlotMutation.mutate(availabilityId);
  };

  // Sample handle for bulk create slots
  const handleBulkCreate = (slots: CreateAvailabilitySlot[]) => {
    bulkCreateSlotsMutation.mutate({ slots });
  };

  // Sample handle for recurring schedule
  const handleRecurringSchedule = (schedule: RecurringSchedule, weeksAhead: number) => {
    recurringScheduleMutation.mutate({ schedule, weeksAhead });
  };

  return (
    <div>
      <h2>Manage Availability</h2>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleFormSubmit}>
        <Input
          name="date"
          type="date"
          value={newSlot.date}
          onChange={handleInputChange}
          placeholder="Select date"
        />
        <Input
          name="startTime"
          type="time"
          value={newSlot.startTime}
          onChange={handleInputChange}
          placeholder="Start time"
        />
        <Input
          name="endTime"
          type="time"
          value={newSlot.endTime}
          onChange={handleInputChange}
          placeholder="End time"
        />
        <Input
          name="maxBookings"
          type="number"
          min="1"
          value={newSlot.maxBookings}
          onChange={handleInputChange}
          placeholder="Max bookings"
        />
        <Textarea
          name="notes"
          value={newSlot.notes}
          onChange={handleInputChange}
          placeholder="Notes"
        />
        <Button type="submit" disabled={createSlotMutation.isPending}>
          {createSlotMutation.isPending ? 'Creating...' : 'Create Slot'}
        </Button>
      </form>
      <div>
        <h3>Existing Availability</h3>
        {availability.length > 0 ? (
          <ul>
            {availability.map((slot) => (
              <li key={slot.id}>
                {slot.date} from {slot.startTime} to {slot.endTime} - {slot.maxBookings} slots
                <Button onClick={() => handleEditSlot(slot.id, { maxBookings: 5 })}>Edit</Button>
                <Button onClick={() => handleDeleteSlot(slot.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No availability slots found.</p>
        )}
      </div>
    </div>
  );
}

