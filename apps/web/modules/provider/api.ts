import { apiClient } from "@/modules/shared/lib/api-client";

// Types for API responses
export interface ProviderDashboardStats {
  services: {
    total: number;
    active: number;
    inactive: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    currency: string;
  };
  students: {
    total: number;
    active: number;
    thisMonth: number;
  };
}

export interface ProviderService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    description: string;
  };
  _count: {
    bookings: number;
    features: number;
  };
}

export interface ProviderServicesSummary {
  total: number;
  active: number;
  inactive: number;
  recentServices: Array<{
    id: string;
    name: string;
    price: number;
    isActive: boolean;
    createdAt: string;
    category: {
      name: string;
    };
  }>;
}

export interface ProviderBooking {
  id: string;
  status: string;
  dateTime: string;
  createdAt: string;
  student: {
    name: string;
    email: string;
  };
  service: {
    name: string;
    price: number;
  };
}

export interface ProviderBookingsRecent {
  bookings: ProviderBooking[];
}

// Provider Dashboard API functions
export const providerDashboardApi = {
  // Get comprehensive dashboard statistics
  async getStats(params?: { startDate?: string; endDate?: string }): Promise<ProviderDashboardStats> {
    const query: Record<string, string> = {};
    if (params?.startDate) query.startDate = params.startDate;
    if (params?.endDate) query.endDate = params.endDate;
    
    const response = await apiClient.provider.dashboard.stats.$get({ query });
    
    if (!response.ok) {
      throw new Error('Failed to fetch provider dashboard stats');
    }
    
    return response.json();
  },

  // Get services summary for dashboard
  async getServicesSummary(): Promise<ProviderServicesSummary> {
    const response = await apiClient.provider.services.summary.$get();
    
    if (!response.ok) {
      throw new Error('Failed to fetch provider services summary');
    }
    
    return response.json();
  },

  // Get recent bookings for dashboard
  async getRecentBookings(limit: number = 5): Promise<ProviderBookingsRecent> {
    const response = await apiClient.provider.bookings.recent.$get({ 
      query: { limit: limit.toString() } 
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch recent bookings');
    }
    
    return response.json();
  },

};

// React Query keys for consistent caching
export const providerDashboardQueryKeys = {
  all: ['provider-dashboard'] as const,
  stats: (params?: { startDate?: string; endDate?: string }) => 
    ['provider-dashboard', 'stats', params] as const,
  servicesSummary: () => ['provider-dashboard', 'services-summary'] as const,
  recentBookings: (limit: number = 5) => ['provider-dashboard', 'recent-bookings', limit] as const,
};
