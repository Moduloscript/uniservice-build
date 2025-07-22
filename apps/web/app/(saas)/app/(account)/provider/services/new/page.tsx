"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/components/select";
import { ArrowLeft, Loader2, DollarSign, Clock, Tag, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createService } from "@/modules/services/api";
import { fetchServiceCategories } from "@/modules/service-categories/api";
import type { ServiceCategory } from "@/modules/service-categories/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Form validation schema
const createServiceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  duration: z.number().int().min(1, "Duration must be at least 1 minute"),
  categoryId: z.string().min(1, "Please select a category"),
});

type CreateServiceFormData = z.infer<typeof createServiceSchema>;

export default function NewServicePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form setup with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 60,
      categoryId: "",
    },
  });

  const categoryId = watch("categoryId");

  // Fetch service categories using TanStack Query
  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchServiceCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: (data) => {
      toast.success("Service created successfully!");
      
      // Invalidate and refetch provider services
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
      queryClient.invalidateQueries({ queryKey: ["provider-dashboard-stats"] });
      
      // Redirect to the provider services management page
      router.push("/app/provider/services");
    },
    onError: (error) => {
      console.error("Failed to create service:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create service. Please try again.");
    },
  });

  // Handle form submission
  const onSubmit = (data: CreateServiceFormData) => {
    // Prevent double submission by checking if already submitting
    if (createServiceMutation.isPending) {
      console.warn("Service creation already in progress");
      return;
    }
    
    // Use mutate instead of mutateAsync to let React Query handle the promise
    createServiceMutation.mutate(data);
  };

  // Show loading state for categories
  if (loadingCategories) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading service categories...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for categories
  if (categoriesError) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to load categories</h2>
            <p className="text-muted-foreground mb-4">
              {categoriesError instanceof Error ? categoriesError.message : "An error occurred"}
            </p>
            <Button onClick={() => router.push("/app/provider/services")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/provider/services">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Service</h1>
          <p className="text-muted-foreground">
            Add a new service to your provider profile
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>
            Fill in the information for your new service offering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Academic Tutoring, Assignment Help"
                {...register("name")}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your service, what it includes, and what makes it special..."
                rows={4}
                {...register("description")}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select
                value={categoryId}
                onValueChange={(value) => setValue("categoryId", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Price and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₦) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register("price", { valueAsNumber: true })}
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="60"
                    {...register("duration", { valueAsNumber: true })}
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.duration && (
                  <p className="text-sm text-destructive">{errors.duration.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/app/provider/services")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || createServiceMutation.isPending}
              >
                {(isSubmitting || createServiceMutation.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Service...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Service
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tips for Creating a Great Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Choose a Clear, Descriptive Name</h4>
              <p className="text-sm text-muted-foreground">
                Make it easy for students to understand what you're offering at a glance.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Write a Compelling Description</h4>
              <p className="text-sm text-muted-foreground">
                Include what's covered, your expertise, and what makes your service unique.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Set Competitive Pricing</h4>
              <p className="text-sm text-muted-foreground">
                Research similar services to ensure your pricing is fair and competitive.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Choose the Right Category</h4>
              <p className="text-sm text-muted-foreground">
                Select the most appropriate category to help students find your service easily.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
