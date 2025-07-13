// Service feature interface for frontend usage
export interface ServiceFeature {
	id: string;
	serviceId: string;
	title: string;
	description?: string | null;
	icon: string;
	orderIndex: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

// API response types
export interface ServiceFeatureResponse {
	feature: ServiceFeature;
}

export interface ServiceFeaturesResponse {
	features: ServiceFeature[];
}

// Request data types
export interface CreateServiceFeatureData {
	title: string;
	description?: string;
	icon?: string;
	orderIndex?: number;
	isActive?: boolean;
}

export interface UpdateServiceFeatureData {
	title?: string;
	description?: string;
	icon?: string;
	orderIndex?: number;
	isActive?: boolean;
}

// Error response type
export interface ServiceFeatureApiError {
	error: string;
}

// Reorder request data
export interface ReorderServiceFeaturesData {
	featureIds: string[];
}

// Reorder response type
export interface ReorderServiceFeaturesResponse {
	features: ServiceFeature[];
}
