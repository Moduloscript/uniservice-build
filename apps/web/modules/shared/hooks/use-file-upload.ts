import { useState, useRef } from "react";
import { v4 as uuid } from "uuid";

interface UseFileUploadOptions {
	userId?: string;
	prefix?: string;
	onUploaded?: (path: string) => void;
}

export function useFileUpload({
	userId,
	prefix = "verification-docs",
	onUploaded,
}: UseFileUploadOptions = {}) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const currentUploadRef = useRef<Promise<string | undefined> | null>(null);
	const lastUploadHashRef = useRef<string | null>(null);

	// Separate loading state for different uploads
	const [isStudentUpload, setStudentUpload] = useState(false);
	const [isProviderUpload, setProviderUpload] = useState(false);

	async function uploadFile(
		file: File,
		customPath?: string,
	): Promise<string | undefined> {
		setError(null);
		if (!file) {
			return;
		}

		// Create a hash of the file to detect duplicates
		const fileHash = `${file.name}-${file.size}-${file.lastModified}-${customPath || ""}`;

		// Prevent duplicate uploads
		if (
			currentUploadRef.current ||
			lastUploadHashRef.current === fileHash
		) {
			console.log("Duplicate file upload prevented:", {
				fileHash,
				isCurrentlyUploading: !!currentUploadRef.current,
			});
			return currentUploadRef.current || undefined;
		}
		const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
		const maxSize = 5 * 1024 * 1024;
		if (!allowedTypes.includes(file.type)) {
			setError("Only JPG, PNG, and PDF files are allowed.");
			return;
		}
		if (file.size > maxSize) {
			setError("File size must be less than 5MB.");
			return;
		}
		setIsUploading(true);
		lastUploadHashRef.current = fileHash;

		// Store the upload promise
		const uploadPromise = (async () => {
			const ext = file.name.split(".").pop() || "jpg";
			const path =
				customPath || `${userId ? `${userId}-` : ""}${uuid()}.${ext}`;

			const res = await fetch(
				`/api/uploads/signed-upload-url?bucket=${prefix}&path=${encodeURIComponent(path)}`,
				{
					method: "POST",
					credentials: "include",
				},
			);

			if (!res.ok) {
				throw new Error(`Failed to get upload URL: ${res.status}`);
			}

			const { signedUrl } = await res.json();

			const uploadRes = await fetch(signedUrl, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type },
			});

			if (!uploadRes.ok) {
				throw new Error(`Failed to upload file: ${uploadRes.status}`);
			}
			if (onUploaded) {
				onUploaded(path);
			}
			return path;
		})();

		currentUploadRef.current = uploadPromise;
		try {
			return await uploadPromise;
		} catch (e) {
			if (e instanceof Error) {
				setError(e.message);
			} else {
				setError("Upload failed");
			}
			return;
		} finally {
			setIsUploading(false);
			currentUploadRef.current = null;
			lastUploadHashRef.current = null;
		}
	}

	return { isUploading, error, uploadFile };
}
