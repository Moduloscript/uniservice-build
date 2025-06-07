import { FormControl, FormLabel, FormMessage } from "@ui/components/form";
import { Input } from "@ui/components/input";
import * as React from "react";
import { Spinner } from "../Spinner";

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
					<Spinner className="size-4" />
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
