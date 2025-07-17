"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Badge } from "@ui/components/badge";
import { Separator } from "@ui/components/separator";
import { Plus, Settings, Users, Calendar, BarChart3, Loader2, TrendingUp, Clock, Star } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading your dashboard...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    );
  }  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-red-500 rounded-full" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-red-600">Error Loading Dashboard</h2>
            <p className="text-sm text-muted-foreground">We're having trouble loading your dashboard data. Please try refreshing the page or contact support if the problem persists.</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header Section */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Provider Dashboard</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your services, bookings, and provider profile
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Live
              </Badge>
              <Button asChild variant="primary">
                <Link href="/app/provider/services/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Service
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Cards Grid - Enhanced */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="group hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">Total Services</CardTitle>
                <div className="p-2 bg-primary rounded-lg group-hover:bg-primary/80 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Settings className="h-4 w-4 text-primary-foreground transition-transform duration-300 group-hover:rotate-12" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-105">{stats?.services.total || 0}</div>
                <div className="flex items-center mt-2 transition-all duration-300 group-hover:translate-x-1">
                  <TrendingUp className="h-3 w-3 text-success mr-1 transition-all duration-300 group-hover:scale-110" />
                  <p className="text-xs text-success font-medium transition-colors duration-300 group-hover:text-success/80">
                    Active services
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl hover:shadow-secondary/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80 cursor-pointer transform hover:scale-[1.02] hover:translate-x-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors duration-300">Total Bookings</CardTitle>
                <div className="p-2 bg-secondary rounded-lg group-hover:bg-secondary/80 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Calendar className="h-4 w-4 text-secondary-foreground transition-transform duration-300 group-hover:-rotate-12" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:text-secondary group-hover:scale-110">{stats?.bookings.total || 0}</div>
                <div className="flex items-center mt-2 transition-all duration-300 group-hover:translate-x-2">
                  <TrendingUp className="h-3 w-3 text-primary mr-1 transition-all duration-300 group-hover:scale-125" />
                  <p className="text-xs text-primary font-medium transition-colors duration-300 group-hover:text-primary/80">
                    All time bookings
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl hover:shadow-accent/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 hover:rotate-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground group-hover:text-accent transition-colors duration-300">Students</CardTitle>
                <div className="p-2 bg-accent rounded-lg group-hover:bg-accent/80 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Users className="h-4 w-4 text-accent-foreground transition-transform duration-300 group-hover:scale-125" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:text-accent group-hover:scale-110 group-hover:rotate-2">{stats?.students.total || 0}</div>
                <div className="flex items-center mt-2 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  <Star className="h-3 w-3 text-primary mr-1 transition-all duration-300 group-hover:scale-125 group-hover:rotate-45" />
                  <p className="text-xs text-muted-foreground font-medium transition-colors duration-300 group-hover:text-accent/80">
                    Unique students served
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 border-0 bg-card/70 backdrop-blur-lg hover:bg-card/80 cursor-pointer transform hover:scale-[1.02] hover:translate-x-1 hover:translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">Revenue</CardTitle>
                <div className="p-2 bg-primary rounded-lg group-hover:bg-primary/80 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <BarChart3 className="h-4 w-4 text-primary-foreground transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-105 group-hover:-rotate-1">{stats?.revenue.total ? `$${stats.revenue.total}` : '$0'}</div>
                <div className="flex items-center mt-2 transition-all duration-300 group-hover:translate-x-2 group-hover:translate-y-1">
                  <TrendingUp className="h-3 w-3 text-primary mr-1 transition-all duration-300 group-hover:scale-125 group-hover:rotate-90" />
                  <p className="text-xs text-muted-foreground font-medium transition-colors duration-300 group-hover:text-primary/80">
                    Total earnings
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8" />

          {/* Main Action Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/80 backdrop-blur-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-secondary rounded-lg group-hover:bg-secondary/80 transition-colors">
                      <Settings className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">My Services</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Manage your service offerings and features
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs text-foreground">
                    {stats?.services.total || 0} Services
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <p className="text-sm text-foreground mb-3">
                      {stats?.services.total ? 
                        `You have ${stats.services.total} active services available for students to book.` : 
                        "You don't have any services yet. Create your first service to get started and begin accepting bookings."
                      }
                    </p>
                    <Button asChild size="sm" variant="primary">
                      <Link href="/app/provider/services/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Service
                      </Link>
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Quick Actions:</span>
                    <div className="flex space-x-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href="/app/provider/services">
                          View All
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/70 backdrop-blur-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-accent rounded-lg group-hover:bg-accent/80 transition-colors">
                      <Calendar className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">Recent Bookings</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Latest booking requests from students
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs text-foreground">
                    {recentBookings?.bookings.length || 0} Recent
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {isBookingsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center space-y-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                        <span className="text-sm text-muted-foreground">Loading bookings...</span>
                      </div>
                    </div>
                  ) : recentBookings?.bookings.length ? (
                    <div className="space-y-3">
                      {recentBookings.bookings.map(booking => (
                        <div key={booking.id} className="flex justify-between items-center p-3 bg-accent/20 rounded-lg hover:bg-accent/30 transition-all">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                              {booking.student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{booking.service.name}</p>
                              <p className="text-xs text-muted-foreground">{booking.student.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-foreground font-medium">
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
                    <div className="text-center p-8 bg-accent/20 rounded-lg">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-foreground mb-2">No recent bookings to display</p>
                      <p className="text-xs text-muted-foreground">New bookings will appear here once students start booking your services</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-muted-foreground">Quick Actions:</span>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/app/bookings">
                        View All Bookings
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
