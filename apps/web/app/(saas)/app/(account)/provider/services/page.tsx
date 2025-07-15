import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Plus, Settings, Edit, Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Badge } from "@ui/components/badge";

export default function ProviderServicesManagement() {
  // Temporarily removing auth check for debugging

  // TODO: Fetch user's services from database
  const services = []; // This would be fetched from the database

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
          <Link href="/app/services/new">
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
                <Link href="/app/services/new">
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
                      <Link href={`/app/services/${service.id}/edit`}>
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
