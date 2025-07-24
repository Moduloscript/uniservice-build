"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";

interface FileUploadOptions {
	userId?: string;
	prefix?: string;
	onProgress?: (progress: number) => void;
	onSuccess?: (path: string) => void;
	onError?: (error: string) => void;
}

interface UploadFileParams {
	file: File;
	customPath?: string;
}

interface UploadResponse {
	signedUrl: string;
	path: string;
}

export function useOptimizedFileUpload(options: FileUploadOptions = {}) {
	const queryClient = useQueryClient();
	const [uploadProgress, setUploadProgress] = useState<number>(0);

	// Get signed URL for upload
	const getSignedUrlMutation = useMutation({
		mutationFn: async (params: {
			bucket: string;
			path: string;
		}): Promise<UploadResponse> => {
			const res = await fetch(
				`/api/uploads/signed-upload-url?bucket=${params.bucket}&path=${encodeURIComponent(params.path)}`,
				{
					method: "POST",
					credentials: "include",
				},
			);

			if (!res.ok) {
				throw new Error(`Failed to get upload URL: ${res.status}`);
			}

			const data = await res.json();
			return {
				signedUrl: data.signedUrl,
				path: params.path,
			};
		},
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
	});

	// Upload file to signed URL with progress tracking
	const uploadToSignedUrlMutation = useMutation({
		mutationFn: async (params: {
			signedUrl: string;
			file: File;
			path: string;
		}): Promise<string> => {
			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();

				// Progress tracking
				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const progress = (event.loaded / event.total) * 100;
						setUploadProgress(progress);
						options.onProgress?.(progress);
					}
				};

				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						setUploadProgress(100);
						resolve(params.path);
					} else {
						reject(
							new Error(
								`Upload failed with status: ${xhr.status}`,
							),
						);
					}
				};

				xhr.onerror = () => {
					reject(new Error("Network error during upload"));
				};

				xhr.ontimeout = () => {
					reject(new Error("Upload timeout"));
				};

				xhr.open("PUT", params.signedUrl);
				xhr.setRequestHeader("Content-Type", params.file.type);
				xhr.timeout = 60000; // 60 second timeout
				xhr.send(params.file);
			});
		},
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
		onSuccess: (path) => {
			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: ["user-files"] });
			queryClient.invalidateQueries({ queryKey: ["onboarding-files"] });

			options.onSuccess?.(path);
			toast.success("File uploaded successfully!");
		},
		onError: (error: Error) => {
			setUploadProgress(0);
			options.onError?.(error.message);
			toast.error(`Upload failed: ${error.message}`);
		},
	});

	// Main upload function that coordinates the process
	const uploadFile = useCallback(
		async (params: UploadFileParams): Promise<string | undefined> => {
			const { file, customPath } = params;

			// Reset progress
			setUploadProgress(0);

			// Validate file
			const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
			const maxSize = 5 * 1024 * 1024; // 5MB

			if (!allowedTypes.includes(file.type)) {
				const error = "Only JPG, PNG, and PDF files are allowed.";
				options.onError?.(error);
				toast.error(error);
				return;
			}

			if (file.size > maxSize) {
				const error = "File size must be less than 5MB.";
				options.onError?.(error);
				toast.error(error);
				return;
			}

			try {
				// Generate path if not provided
				const ext = file.name.split(".").pop() || "jpg";
				const path =
					customPath ||
					`${options.userId ? `${options.userId}-` : ""}${uuid()}.${ext}`;
				const bucket = options.prefix || "verification-docs";

				// Get signed URL
				const { signedUrl } = await getSignedUrlMutation.mutateAsync({
					bucket,
					path,
				});

				// Upload file
				const uploadedPath =
					await uploadToSignedUrlMutation.mutateAsync({
						signedUrl,
						file,
						path,
					});

				return uploadedPath;
			} catch (error) {
				console.error("Upload error:", error);
				return;
			}
		},
		[
			options.userId,
			options.prefix,
			options.onError,
			options.onSuccess,
			getSignedUrlMutation.mutateAsync,
			uploadToSignedUrlMutation.mutateAsync,
		],
	);

	const reset = useCallback(() => {
		setUploadProgress(0);
		getSignedUrlMutation.reset();
		uploadToSignedUrlMutation.reset();
	}, [getSignedUrlMutation.reset, uploadToSignedUrlMutation.reset]);

	const isUploading =
		getSignedUrlMutation.isPending || uploadToSignedUrlMutation.isPending;
	const error =
		getSignedUrlMutation.error?.message ||
		uploadToSignedUrlMutation.error?.message;

	return {
		uploadFile,
		isUploading,
		progress: uploadProgress,
		error,
		reset,
		// Additional state for granular control
		isGettingSignedUrl: getSignedUrlMutation.isPending,
		isUploadingToStorage: uploadToSignedUrlMutation.isPending,
	};
}
