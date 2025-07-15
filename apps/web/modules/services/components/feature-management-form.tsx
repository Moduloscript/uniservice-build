"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Textarea } from "@ui/components/textarea";
import { Plus, Edit3, CheckCircle } from "lucide-react";
import type { ServiceFeature, CreateServiceFeatureData, UpdateServiceFeatureData } from "../types/service-feature";

const featureFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  icon: z.string().default("check-circle"),
  orderIndex: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

type FeatureFormData = z.infer<typeof featureFormSchema>;

interface FeatureManagementFormProps {
  existingFeature?: ServiceFeature;
  onSubmit: (data: CreateServiceFeatureData | UpdateServiceFeatureData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function FeatureManagementForm({
  existingFeature,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: FeatureManagementFormProps) {
  const isEditing = !!existingFeature;

  const form = useForm<FeatureFormData>({
    resolver: zodResolver(featureFormSchema),
    defaultValues: {
      title: existingFeature?.title || "",
      description: existingFeature?.description || "",
      icon: existingFeature?.icon || "check-circle",
      orderIndex: existingFeature?.orderIndex || 0,
      isActive: existingFeature?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: FeatureFormData) => {
    try {
      const submitData = {
        title: data.title,
        description: data.description || undefined,
        icon: data.icon,
        orderIndex: data.orderIndex,
        isActive: data.isActive,
      };
      
      await onSubmit(submitData);
      
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error("Failed to submit feature:", error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Edit3 className="h-5 w-5 text-primary" />
              Edit Feature
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 text-primary" />
              Add New Feature
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feature Title *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g., 1-on-1 tutoring session" 
                      maxLength={100}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief, descriptive title for this feature
                  </FormDescription>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <FormMessage />
                    <span>{field.value?.length || 0}/100</span>
                  </div>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Provide additional details about this feature..."
                      className="min-h-[80px] resize-none"
                      maxLength={500}
                    />
                  </FormControl>
                  <FormDescription>
                    Add more details to help students understand what's included
                  </FormDescription>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <FormMessage />
                    <span>{field.value?.length || 0}/500</span>
                  </div>
                </FormItem>
              )}
            />

            {/* Order Index */}
            <FormField
              control={form.control}
              name="orderIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      min={0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormDescription>
                    Lower numbers appear first (0 = first position)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            {form.watch("title") && (
              <div className="bg-muted/30 border border-muted rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">Preview:</div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{form.watch("title")}</div>
                    {form.watch("description") && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {form.watch("description")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-muted">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isEditing ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  isEditing ? "Update Feature" : "Add Feature"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
