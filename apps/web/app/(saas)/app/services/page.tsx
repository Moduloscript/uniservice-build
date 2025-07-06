import { Suspense } from "react";
import { ServicesMarketplace } from "../../../../modules/services/services-marketplace";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { ArrowLeft, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@ui/components/button";

export default function ServicesPage() {
	return (
		<>
			{/* Breadcrumb Navigation */}
			<div className="flex items-center gap-2 mb-6 text-sm">
				<Link 
					href="/app" 
					className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Dashboard
				</Link>
			</div>

			{/* Professional Page Header */}
			<PageHeader 
				title="Service Marketplace"
				subtitle="Discover and book trusted services from the UNIBEN community"
			/>

			{/* Services Content */}
			<Suspense fallback={
				<div className="flex items-center justify-center py-12">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Store className="h-5 w-5 animate-pulse" />
						<span>Loading services...</span>
					</div>
				</div>
			}>
				<ServicesMarketplace />
			</Suspense>
		</>
	);
}
