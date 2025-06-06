import { FormControl, FormLabel, FormMessage } from "@ui/components/form";
import { Input } from "@ui/components/input";
import * as React from "react";

export interface FileUploadFieldProps {
	label: string;
	description?: string;
	value: string;
	onFileChange: (file: File | null, uploadedPath?: string) => void;
	isLoading?: boolean;
	error?: string | null;
	accept?: string;
	helpText?: string;
	disabled?: boolean;
}

export function FileUploadField({
	label,
	description,
	value,
	onFileChange,
	isLoading,
	error,
	accept = "image/jpeg,image/png,application/pdf",
	helpText,
	disabled,
}: FileUploadFieldProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0] || null;
		onFileChange(file);
	}

	return (
		<div className="space-y-1">
			<FormLabel>{label}</FormLabel>
			{description && (
				<p className="text-xs text-muted-foreground mb-1">
					{description}
				</p>
			)}
			<FormControl>
				<div>
					<Input
						ref={inputRef}
						type="file"
						accept={accept}
						disabled={isLoading || disabled}
						onChange={handleChange}
					/>
					{value && (
						<Input value={value} className="hidden" readOnly />
					)}
				</div>
			</FormControl>
			{isLoading && (
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<svg
						className="animate-spin h-4 w-4 text-primary"
						viewBox="0 0 24 24"
					>
						<title>Loading</title>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
							fill="none"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8v8z"
						/>
					</svg>
					Uploading...
				</div>
			)}
			{error && (
				<div className="text-xs text-destructive" role="alert">
					{error}
				</div>
			)}
			{helpText && (
				<p className="text-muted-foreground text-xs">{helpText}</p>
			)}
			<FormMessage className="text-xs" />
		</div>
	);
}
