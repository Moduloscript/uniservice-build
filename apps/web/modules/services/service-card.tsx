import type { Service } from "./types";
import { cn } from "@ui/lib";

interface ServiceCardProps {
	service: Service;
	onClick?: () => void;
	className?: string;
}

export function ServiceCard({ service, onClick, className }: ServiceCardProps) {
	return (
		<button
			type="button"
			className={cn(
				"flex flex-col items-start rounded-lg border bg-white shadow-sm hover:shadow-md transition p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
				className,
			)}
			onClick={onClick}
			aria-label={service.name}
		>
			<span className="text-lg font-semibold text-gray-900 mb-1">
				{service.name}
			</span>
			<span className="text-sm text-gray-500 mb-2">
				{service.category?.name}
			</span>
			<span className="text-base text-primary font-bold mb-1">
				₦{service.price.toLocaleString()}
			</span>
			<span className="text-xs text-gray-400 mb-2">
				Duration: {service.duration} min
			</span>
			{service.provider && (
				<span className="text-xs text-gray-500">
					By {service.provider.name}
				</span>
			)}
			<span className="sr-only">View service details</span>
		</button>
	);
}
