import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Settings, Edit, Eye, ArrowLeft, Users, Calendar, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@ui/components/badge";

interface ProviderServiceDetailProps {
  params: { serviceId: string };
}

export default function ProviderServiceDetail({ params }: ProviderServiceDetailProps) {
  // Temporarily removing auth check for debugging

  // TODO: Fetch service details from database
  const service = {
    id: params.serviceId,
    name: "Sample Service",
    description: "This is a sample service description",
    price: 50,
    duration: 60,
    status: "active",
    totalBookings: 12,
    averageRating: 4.8,
    totalReviews: 8,
    // This would be fetched from the database
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/app/provider/services">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
          <p className="text-muted-foreground">
            Manage your service settings, features, and performance
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{service.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              All time bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{service.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              From {service.totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price</CardTitle>
            <span className="text-2xl font-bold">${service.price}</span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Per {service.duration} minute session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Badge status={service.status === "active" ? "success" : "info"}>
              {service.status === "active" ? "Active" : "Draft"}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Service visibility
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Management</CardTitle>
            <CardDescription>
              Manage your service settings and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button asChild size="sm" className="w-full justify-start">
                <Link href={`/app/provider/services/${service.id}/features`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Features
                </Link>
              </Button>
              
              <Button asChild size="sm" variant="outline" className="w-full justify-start">
                <Link href={`/app/services/${service.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Service Details
                </Link>
              </Button>
              
              <Button asChild size="sm" variant="outline" className="w-full justify-start">
                <Link href={`/app/services/${service.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Page
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Performance</CardTitle>
            <CardDescription>
              Track how your service is performing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <span className="text-sm text-muted-foreground">12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Repeat Bookings</span>
                <span className="text-sm text-muted-foreground">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Revenue</span>
                <span className="text-sm text-muted-foreground">${service.totalBookings * service.price}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Management</CardTitle>
          <CardDescription>
            Customize what's included with your service to attract more bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Features help students understand what they'll get when they book your service. 
              The more detailed and specific you are, the more likely students are to book.
            </p>
            
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href={`/app/provider/services/${service.id}/features`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Service Features
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href={`/app/services/${service.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Changes
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
