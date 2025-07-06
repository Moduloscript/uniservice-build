import type { BookingStatus } from "../types";

interface BookingStatusBadgeProps {
	status: BookingStatus;
	className?: string;
}

export function BookingStatusBadge({ status, className = "" }: BookingStatusBadgeProps) {
	const getStatusColor = (status: BookingStatus) => {
		switch (status) {
			case "PENDING":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "CONFIRMED":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "COMPLETED":
				return "bg-green-100 text-green-800 border-green-200";
			case "CANCELLED":
				return "bg-red-100 text-red-800 border-red-200";
			case "REFUNDED":
				return "bg-purple-100 text-purple-800 border-purple-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusText = (status: BookingStatus) => {
		switch (status) {
			case "PENDING":
				return "Pending";
			case "CONFIRMED":
				return "Confirmed";
			case "COMPLETED":
				return "Completed";
			case "CANCELLED":
				return "Cancelled";
			case "REFUNDED":
				return "Refunded";
			default:
				return status;
		}
	};

	return (
		<span 
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)} ${className}`}
		>
			{getStatusText(status)}
		</span>
	);
}
