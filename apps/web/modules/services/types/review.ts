export interface Review {
	id: string;
	rating: number;
	comment?: string;
	bookingId: string;
	authorId: string;
	targetId: string;
	createdAt: string;
	updatedAt: string;
	author: {
		id: string;
		name: string;
		userType: string;
	};
	target: {
		id: string;
		name: string;
		userType: string;
	};
	booking: {
		id: string;
		serviceId: string;
		dateTime: string;
		status: string;
	};
}

export interface ReviewsResponse {
	reviews: Review[];
}

export interface ReviewResponse {
	review: Review;
}

export interface CreateReviewData {
	rating: number;
	comment?: string;
	bookingId: string;
}

export interface UpdateReviewData {
	rating?: number;
	comment?: string;
}

export interface ReviewApiError {
	error: string;
}
