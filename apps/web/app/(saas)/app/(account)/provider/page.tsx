"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Plus, Settings, Users, Calendar, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import { providerDashboardApi, providerDashboardQueryKeys } from '@/modules/provider/api';

export default function ProviderDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: providerDashboardQueryKeys.stats(),
    queryFn: () => providerDashboardApi.getStats(),
  });

  const { data: recentBookings, isLoading: isBookingsLoading } = useQuery({
    queryKey: providerDashboardQueryKeys.recentBookings(),
    queryFn: () => providerDashboardApi.getRecentBookings(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Error Loading Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your services, bookings, and provider profile
          </p>
        </div>
        <Button asChild>
          <Link href="/app/services/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.services.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bookings.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.students.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unique students served
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.revenue.total ? `$${stats.revenue.total}` : '$0'}</div>
            <p className="text-xs text-muted-foreground">
              Total earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Services</CardTitle>
            <CardDescription>
              Manage your service offerings and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-muted-foreground">
              {stats?.services.total ? `${stats.services.total} active services available.` : "You don't have any services yet. Create your first service to get started."}
              </p>
              <Button asChild size="sm" className="w-fit">
                <Link href="/app/services/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest booking requests from students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              {isBookingsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading bookings...</span>
                </div>
              ) : recentBookings?.bookings.length ? (
                <div className="space-y-2">
                  {recentBookings.bookings.map(booking => (
                    <div key={booking.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <p className="text-sm font-medium">{booking.service.name}</p>
                        <p className="text-xs text-muted-foreground">{booking.student.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.dateTime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.dateTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent bookings to display.
                </p>
              )}
              <Button asChild size="sm" variant="outline" className="w-fit">
                <Link href="/app/bookings">
                  View All Bookings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
