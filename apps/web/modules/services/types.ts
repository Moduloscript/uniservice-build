// Service interface for frontend usage
export interface Service {
	id: string;
	name: string;
	description: string;
	price: number; // Converted from Decimal in API
	duration: number;
	categoryId: string;
	providerId: string;
	isActive?: boolean;
	createdAt?: string;
	updatedAt?: string;
	category?: {
		id: string;
		name: string;
		description?: string;
	};
	provider?: {
		id: string;
		name: string;
		email?: string;
		userType?: string;
	};
}

// API response types
export interface ServiceResponse {
	service: Service;
}

export interface ServicesResponse {
	services: Service[];
}

// Error response type
export interface ApiErrorResponse {
	error: string;
}
