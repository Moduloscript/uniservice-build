// Service outcome interface for frontend usage
export interface ServiceOutcome {
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
export interface ServiceOutcomeResponse {
	outcome: ServiceOutcome;
}

export interface ServiceOutcomesResponse {
	outcomes: ServiceOutcome[];
}

// Request data types
export interface CreateServiceOutcomeData {
	title: string;
	description?: string;
	icon?: string;
	orderIndex?: number;
	isActive?: boolean;
}

export interface UpdateServiceOutcomeData {
	title?: string;
	description?: string;
	icon?: string;
	orderIndex?: number;
	isActive?: boolean;
}

// Error response type
export interface ServiceOutcomeApiError {
	error: string;
}

// Reorder request data
export interface ReorderServiceOutcomesData {
	outcomeIds: string[];
}

// Reorder response type
export interface ReorderServiceOutcomesResponse {
	outcomes: ServiceOutcome[];
}
