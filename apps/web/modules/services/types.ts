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
	// Dynamic service stats fields
	availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE' | 'LIMITED';
	serviceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
	maxStudents?: number;
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
		verified?: boolean;
		isVerified?: boolean;
		createdAt?: string;
		verificationStatus?: string;
		department?: string;
		level?: number;
		providerCategory?: string;
		matricNumber?: string;
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
