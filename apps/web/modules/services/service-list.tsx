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
				"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
			}
		>
			{services.map((service) => (
				<Link
					key={service.id}
					href={`/app/services/${service.id}`}
					passHref
					legacyBehavior
				>
					<a href={`/app/services/${service.id}`} style={{ display: "block" }}>
						<ServiceCard service={service} />
					</a>
				</Link>
			))}
		</div>
	);
}
