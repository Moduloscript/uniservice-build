import { useState } from "react";
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

	async function uploadFile(
		file: File,
		customPath?: string,
	): Promise<string | undefined> {
		setError(null);
		if (!file) {
			return;
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
		try {
			const ext = file.name.split(".").pop() || "jpg";
			const path =
				customPath ||
				`${prefix}/${userId ? `${userId}-` : ""}${uuid()}.${ext}`;
			const res = await fetch(
				`/api/uploads/signed-upload-url?bucket=${prefix}&path=${encodeURIComponent(path)}`,
				{
					method: "POST",
					credentials: "include",
				},
			);
			if (!res.ok) {
				throw new Error("Failed to get upload URL");
			}
			const { signedUrl } = await res.json();
			const uploadRes = await fetch(signedUrl, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type },
			});
			if (!uploadRes.ok) {
				throw new Error("Failed to upload file");
			}
			if (onUploaded) {
				onUploaded(path);
			}
			return path;
		} catch (e) {
			if (e instanceof Error) {
				setError(e.message);
			} else {
				setError("Upload failed");
			}
			return;
		} finally {
			setIsUploading(false);
		}
	}

	return { isUploading, error, uploadFile };
}
