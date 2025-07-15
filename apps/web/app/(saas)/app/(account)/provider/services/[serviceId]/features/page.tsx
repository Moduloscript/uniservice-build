"use client";

import { useState } from "react";
import { FeatureManagementForm } from "../../../../../../../modules/services/components/feature-management-form";
import { useServiceFeaturesManagement } from "../../../../../../../modules/services/hooks/use-service-features-management";
import { Button } from "@ui/components/button";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from "@ui/components/sortable-item";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { ServiceFeature } from "../../../../../../../modules/services/types/service-feature";

export default function ProviderFeaturesManagementPage({ params }: { params: { serviceId: string } }) {
  const {
    features,
    isLoading, 
    error, 
    addFeature, 
    updateFeature, 
    deleteFeature,
    reorderFeatures,
    isAnyPending
  } = useServiceFeaturesManagement(params.serviceId);

  const [editingFeature, setEditingFeature] = useState<ServiceFeature | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
  );

  const handleAddFeature = (data: Omit<ServiceFeature, 'id' | 'serviceId'>) => {
    addFeature(data);
  };

  const handleDeleteFeature = (featureId: string) => {
    if (confirm('Are you sure you want to delete this feature? This action cannot be undone.')) {
      deleteFeature(featureId);
    }
  };

  const handleSortEnd = ({ active, over }: { active: any, over: any }) => {
    if (active.id !== over.id) {
      const oldIndex = features.findIndex(f => f.id === active.id);
      const newIndex = features.findIndex(f => f.id === over.id);

      const newFeatures = arrayMove(features, oldIndex, newIndex);

      reorderFeatures(newFeatures.map(f => f.id));
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Title and description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            Manage Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Here are the features available for your service. Add new features, edit or remove existing ones, and reorder them to suit your preference.
          </p>
        </CardContent>
      </Card>

      {/* Add/Update Feature Form */}
      <FeatureManagementForm 
        existingFeature={editingFeature}
        onSubmit={editingFeature ? data => updateFeature({ featureId: editingFeature.id, data }) : handleAddFeature}
        onCancel={() => setEditingFeature(null)}
        isSubmitting={isAnyPending}
      />

      {/* Feature List */}
      {isLoading ? (
        <Card className="p-4 text-center">
          <p>Loading features...</p>
        </Card>
      ) : error ? (
        <Card className="p-4 text-center text-destructive">
          <AlertCircle className="w-5 h-5 inline-block" />
          <p className="inline-block ml-2">Failed to load features</p>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSortEnd}>
          <SortableContext items={features.map(feature => feature.id)} strategy={verticalListSortingStrategy}>
            {features.map(feature => (
              <SortableItem key={feature.id} id={feature.id}>
                <Card className="mb-2">
                  <CardHeader className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>{feature.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingFeature(feature)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteFeature(feature.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      )}
    </main>
  );
}
