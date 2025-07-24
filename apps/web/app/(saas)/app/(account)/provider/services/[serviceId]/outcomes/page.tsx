"use client";

import { useState } from "react";
import { OutcomeManagementForm } from "../../../../../../../modules/services/components/outcome-management-form";
import { useServiceOutcomesManagement } from "../../../../../../../modules/services/hooks/use-service-outcomes-management";
import { Button } from "@ui/components/button";
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@ui/components/sortable-item";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { AlertCircle, Target, Trash2 } from "lucide-react";
import type { ServiceOutcome } from "../../../../../../../modules/services/types/service-outcome";

export default function ProviderOutcomesManagementPage({
	params,
}: { params: { serviceId: string } }) {
	const {
		outcomes,
		isLoading,
		error,
		addOutcome,
		updateOutcome,
		deleteOutcome,
		reorderOutcomes,
		isAnyPending,
	} = useServiceOutcomesManagement(params.serviceId);

	const [editingOutcome, setEditingOutcome] = useState<ServiceOutcome | null>(
		null,
	);

	const sensors = useSensors(useSensor(PointerSensor));

	const handleAddOutcome = (
		data: Omit<ServiceOutcome, "id" | "serviceId">,
	) => {
		addOutcome(data);
	};

	const handleDeleteOutcome = (outcomeId: string) => {
		if (
			confirm(
				"Are you sure you want to delete this outcome? This action cannot be undone.",
			)
		) {
			deleteOutcome(outcomeId);
		}
	};

	const handleSortEnd = ({ active, over }: { active: any; over: any }) => {
		if (active.id !== over.id) {
			const oldIndex = outcomes.findIndex((o) => o.id === active.id);
			const newIndex = outcomes.findIndex((o) => o.id === over.id);

			const newOutcomes = arrayMove(outcomes, oldIndex, newIndex);

			reorderOutcomes(newOutcomes.map((o) => o.id));
		}
	};

	return (
		<main className="max-w-4xl mx-auto py-6 px-4 space-y-6">
			{/* Title and description */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-3">
						<Target className="w-5 h-5 text-primary" />
						Manage Learning Outcomes
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Here are the learning outcomes available for your
						service. Add new outcomes, edit or remove existing ones,
						and reorder them to suit your preference.
					</p>
				</CardContent>
			</Card>

			{/* Add/Update Outcome Form */}
			<OutcomeManagementForm
				existingOutcome={editingOutcome}
				onSubmit={
					editingOutcome
						? (data) =>
								updateOutcome({
									outcomeId: editingOutcome.id,
									data,
								})
						: handleAddOutcome
				}
				onCancel={() => setEditingOutcome(null)}
				isSubmitting={isAnyPending}
			/>

			{/* Outcome List */}
			{isLoading ? (
				<Card className="p-4 text-center">
					<p>Loading learning outcomes...</p>
				</Card>
			) : error ? (
				<Card className="p-4 text-center text-destructive">
					<AlertCircle className="w-5 h-5 inline-block" />
					<p className="inline-block ml-2">Failed to load outcomes</p>
				</Card>
			) : (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleSortEnd}
				>
					<SortableContext
						items={outcomes.map((outcome) => outcome.id)}
						strategy={verticalListSortingStrategy}
					>
						{outcomes.map((outcome) => (
							<SortableItem key={outcome.id} id={outcome.id}>
								<Card className="mb-2">
									<CardHeader className="flex items-center justify-between px-4 py-2">
										<div className="flex items-center gap-2">
											<Target className="w-5 h-5 text-blue-600" />
											<span>{outcome.title}</span>
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													setEditingOutcome(outcome)
												}
											>
												Edit
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													handleDeleteOutcome(
														outcome.id,
													)
												}
											>
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
