// Service interface for frontend usage
export interface Service {
	id: string;
	name: string;
	description: string;
	price: number;
	duration: number;
	categoryId: string;
	providerId: string;
	category?: {
		id: string;
		name: string;
		description?: string;
	};
	provider?: {
		id: string;
		name: string;
	};
}
