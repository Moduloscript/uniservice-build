import type { Service } from "./types";
import { ServiceCard } from "./service-card";
import Link from "next/link";

interface ServiceListProps {
	services: Service[];
	className?: string;
}

export function ServiceList({ services, className }: ServiceListProps) {
	return (
		<div
			className={
				className ??
				"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
			}
		>
			{services.map((service) => (
				<Link
					key={service.id}
					href={`/app/services/${service.id}`}
					className="block h-full transition-transform hover:-translate-y-1 duration-200"
				>
					<ServiceCard service={service} />
				</Link>
			))}
		</div>
	);
}
