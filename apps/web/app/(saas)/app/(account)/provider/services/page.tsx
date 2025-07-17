"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Plus, Settings, Edit, Eye, MoreHorizontal, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@ui/components/badge";
import { fetchServices } from "@/modules/services/api";
import { useAuth } from "@repo/auth/client";

export default function ProviderServicesManagement() {
  const { user, isLoading: authLoading } = useAuth();

  // Fetch provider's services using TanStack Query
  const {
    data: services = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["provider-services", user?.id],
    queryFn: () => fetchServices({ providerId: user?.id || "" }),
    enabled: !!user?.id && !authLoading,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
            <p className="text-muted-foreground">
              Manage your service offerings, features, and settings
            </p>
          </div>
          <Button disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading your services...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
            <p className="text-muted-foreground">
              Manage your service offerings, features, and settings
            </p>
          </div>
          <Button asChild>
            <Link href="/app/provider/services/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Service
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to load services</h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
          <p className="text-muted-foreground">
            Manage your service offerings, features, and settings
          </p>
        </div>
        <Button asChild>
          <Link href="/app/provider/services/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Link>
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Services Yet</CardTitle>
            <CardDescription>
              You haven't created any services yet. Create your first service to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-muted-foreground">
                Services are the core of your provider profile. Each service represents a specific offering
                you provide to students, complete with features, pricing, and booking options.
              </p>
              <Button asChild className="w-fit">
                <Link href="/app/provider/services/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Service
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service: any) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Badge status={service.status === "active" ? "success" : "info"}>
                    {service.status === "active" ? "Active" : "Draft"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">${service.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{service.duration} min</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Bookings</span>
                    <span className="font-medium">{service.totalBookings || 0}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/app/services/${service.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/app/provider/services/${service.id}/features`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Features
                      </Link>
                    </Button>
                    
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/app/provider/services/${service.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Service Management Tips</CardTitle>
          <CardDescription>
            Make the most of your service offerings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Customize Your Features</h4>
              <p className="text-sm text-muted-foreground">
                Each service can have unique features that highlight what's included. 
                Use the "Features" button to customize what makes your service special.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Keep Information Updated</h4>
              <p className="text-sm text-muted-foreground">
                Regular updates to your service descriptions and features help students 
                understand your offerings better and increase booking rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
