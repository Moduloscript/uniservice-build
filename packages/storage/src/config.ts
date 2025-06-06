// Max file size: 5MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
export const ALLOWED_FILE_TYPES = [
	"image/jpeg",
	"image/png",
	"application/pdf",
] as const;
export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

// Storage bucket configurations
export type StorageBucketConfig = {
	allowedFileTypes: readonly AllowedFileType[];
	maxFileSize: number;
	public: boolean;
	pathPrefix: string;
};

export const BUCKET_CONFIGS: Record<string, StorageBucketConfig> = {
	"verification-docs": {
		allowedFileTypes: ALLOWED_FILE_TYPES,
		maxFileSize: MAX_FILE_SIZE,
		public: false,
		pathPrefix: "verification-docs/",
	},
	"student-id-cards": {
		allowedFileTypes: ALLOWED_FILE_TYPES,
		maxFileSize: MAX_FILE_SIZE,
		public: false,
		pathPrefix: "student-id-cards/",
	},
	avatars: {
		allowedFileTypes: ["image/jpeg", "image/png"] as const,
		maxFileSize: MAX_FILE_SIZE,
		public: true,
		pathPrefix: "avatars/",
	},
} as const;
