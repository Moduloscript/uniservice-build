"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@ui/lib";

interface SortableItemProps {
	id: string;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
}

export function SortableItem({
	id,
	children,
	className,
	disabled = false,
}: SortableItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		isOver,
	} = useSortable({ id, disabled });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"relative group",
				isDragging && "opacity-50 z-50",
				isOver && "scale-105",
				className,
			)}
			{...attributes}
		>
			{/* Drag Handle */}
			<div
				className={cn(
					"absolute left-2 top-1/2 -translate-y-1/2 z-10",
					"opacity-0 group-hover:opacity-100 transition-opacity duration-200",
					"cursor-grab active:cursor-grabbing",
					disabled && "cursor-not-allowed opacity-0",
				)}
				{...listeners}
			>
				<GripVertical className="h-4 w-4 text-muted-foreground" />
			</div>

			{/* Content */}
			<div className={cn("relative", !disabled && "pl-8")}>
				{children}
			</div>
		</div>
	);
}
