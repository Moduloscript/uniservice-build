"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@ui/components/tooltip";
import { cn } from "@ui/lib";
import { Archive, FileIcon, FileText, FileType, ImageIcon } from "lucide-react";

interface DocumentTypeIconProps {
	filename: string;
	className?: string;
	showTooltip?: boolean;
	size?: number;
}

const FILE_TYPES = {
	// Images
	jpg: { icon: ImageIcon, label: "Image" },
	jpeg: { icon: ImageIcon, label: "Image" },
	png: { icon: ImageIcon, label: "Image" },
	gif: { icon: ImageIcon, label: "Image" },
	webp: { icon: ImageIcon, label: "Image" },

	// Documents
	pdf: { icon: FileType, label: "PDF Document" },
	doc: { icon: FileText, label: "Word Document" },
	docx: { icon: FileText, label: "Word Document" },
	txt: { icon: FileText, label: "Text Document" },

	// Archives
	zip: { icon: Archive, label: "Archive" },
	rar: { icon: Archive, label: "Archive" },
} as const;

export function DocumentTypeIcon({
	filename,
	className,
	showTooltip = true,
	size = 16,
}: DocumentTypeIconProps) {
	const extension = filename.split(".").pop()?.toLowerCase() || "";
	const fileType = FILE_TYPES[extension as keyof typeof FILE_TYPES];

	const Icon = fileType?.icon || FileIcon;
	const label = fileType?.label || "Document";

	const icon = (
		<Icon
			className={cn("text-muted-foreground/70", className)}
			size={size}
			aria-hidden="true"
		/>
	);

	if (!showTooltip) return icon;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{icon}</TooltipTrigger>
				<TooltipContent>
					<p>{label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
