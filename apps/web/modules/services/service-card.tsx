import type { Service } from "./types";
import { cn } from "@ui/lib";
import { Clock, User } from "lucide-react";

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
				"group flex flex-col items-start rounded-lg border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 p-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-left w-full h-full",
				className,
			)}
			onClick={onClick}
			aria-label={service.name}
		>
			{/* Category Badge */}
			{service.category && (
				<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
					{service.category.name}
				</span>
			)}

			{/* Service Name */}
			<h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
				{service.name}
			</h3>

			{/* Description */}
			<p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-grow leading-relaxed">
				{service.description}
			</p>

			{/* Price and Duration */}
			<div className="flex items-center justify-between w-full mb-4">
				<div className="flex flex-col">
					<span className="text-2xl font-bold text-primary">
						₦{service.price.toLocaleString()}
					</span>
					<span className="text-xs text-muted-foreground">per service</span>
				</div>
				<div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
					<Clock className="h-3.5 w-3.5 text-muted-foreground" />
					<span className="text-sm font-medium text-muted-foreground">{service.duration}min</span>
				</div>
			</div>

			{/* Provider Info */}
			{service.provider && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-4 w-full">
					<div className="flex items-center justify-center w-6 h-6 bg-muted rounded-full">
						<User className="h-3.5 w-3.5" />
					</div>
					<span className="font-medium">by {service.provider.name}</span>
				</div>
			)}
			
			<span className="sr-only">View service details</span>
		</button>
	);
}
