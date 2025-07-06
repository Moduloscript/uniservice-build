"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@ui/components/tooltip";
import { cn } from "@ui/lib";
import {
	BookmarkIcon,
	BuildingIcon,
	CalendarIcon,
	ClockIcon,
	DatabaseIcon,
	FileIcon,
	GraduationCapIcon,
	HashIcon,
	TagIcon,
} from "lucide-react";
import type { VerificationDoc } from "../../types";

interface MetadataItemProps {
	icon: React.ReactNode;
	label: string;
	value?: string | null;
	className?: string;
	priority?: "high" | "medium" | "low";
}

function MetadataItem({
	icon,
	label,
	value,
	className,
	priority = "medium",
}: MetadataItemProps) {
	if (!value) return null;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className={cn(
							"flex items-center gap-1.5 text-sm",
							"transition-colors rounded-md px-1.5 py-0.5",
							priority === "high" &&
								"bg-primary/5 text-primary hover:bg-primary/10",
							priority === "medium" &&
								"text-muted-foreground hover:text-foreground/80",
							priority === "low" &&
								"text-muted-foreground/70 hover:text-muted-foreground",
							className,
						)}
					>
						{icon}
						<span className="truncate max-w-[150px] font-medium">
							{value}
						</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p className="text-xs">
						{label}: {value}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

interface MetadataDisplayProps {
	doc: VerificationDoc;
	className?: string;
	showExtended?: boolean;
}

export function MetadataDisplay({
	doc,
	className,
	showExtended = false,
}: MetadataDisplayProps) {
	const { metadata = {} } = doc;
	const submittedDate = new Date(doc.submittedAt).toLocaleDateString();
	const submittedTime = new Date(doc.submittedAt).toLocaleTimeString();
	const category = (metadata?.category || metadata?.providerCategory) as string | undefined;

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex flex-wrap items-center gap-2">
				{/* High priority metadata */}
				{typeof category === "string" && (
					<MetadataItem
						icon={<TagIcon className="h-4 w-4" />}
						label="Category"
						value={category}
						priority="high"
					/>
				)}
				{typeof metadata?.documentType === "string" && (
					<MetadataItem
						icon={<FileIcon className="h-4 w-4" />}
						label="Document Type"
						value={metadata.documentType}
						priority="high"
					/>
				)}
				{typeof metadata?.department === "string" && (
					<MetadataItem
						icon={<GraduationCapIcon className="h-4 w-4" />}
						label="Department"
						value={metadata.department}
						priority="high"
					/>
				)}
			</div>

			{showExtended && (
				<div className="flex flex-wrap items-center gap-2">
					{/* Medium priority metadata */}
					<MetadataItem
						icon={<CalendarIcon className="h-4 w-4" />}
						label="Submitted Date"
						value={submittedDate}
					/>
					<MetadataItem
						icon={<ClockIcon className="h-4 w-4" />}
						label="Submitted Time"
						value={submittedTime}
					/>
					<MetadataItem
						icon={<HashIcon className="h-4 w-4" />}
						label="ID"
						value={doc.id}
					/>{" "}
					{/* Student-specific metadata */}
					{typeof metadata?.matricNumber === "string" && (
						<MetadataItem
							icon={<DatabaseIcon className="h-4 w-4" />}
							label="Matric Number"
							value={metadata.matricNumber}
						/>
					)}
					{typeof metadata?.level === "number" && (
						<MetadataItem
							icon={<BookmarkIcon className="h-4 w-4" />}
							label="Level"
							value={String(metadata.level)}
						/>
					)}
					{/* Provider-specific metadata */}
					{typeof metadata?.organization === "string" && (
						<MetadataItem
							icon={<BuildingIcon className="h-4 w-4" />}
							label="Organization"
							value={metadata.organization}
							priority="low"
						/>
					)}
				</div>
			)}
		</div>
	);
}
