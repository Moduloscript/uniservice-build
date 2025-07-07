import { Suspense } from "react";
import { ServicesMarketplace } from "../../../../modules/services/services-marketplace";
import { ChevronRight, Home, Store } from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
	return (
		<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
			{/* Professional Header with Navigation */}
			<div className="pt-6 mb-8 pb-6 border-b border-border">
				{/* Enhanced Breadcrumb Navigation */}
				<nav aria-label="Breadcrumb" className="mb-4">
					<ol className="flex items-center space-x-3 text-base">
						<li>
							<Link 
								href="/app" 
								className="flex items-center px-3 py-2 rounded-md bg-muted/50 hover:bg-muted text-foreground hover:text-primary transition-all duration-200 font-medium"
							>
								<Home className="h-5 w-5 mr-2" />
								Dashboard
							</Link>
						</li>
						<li>
							<ChevronRight className="h-5 w-5 text-muted-foreground" />
						</li>
						<li aria-current="page">
							<span className="flex items-center px-3 py-2 rounded-md bg-primary/10 text-primary font-medium">
								<Store className="h-5 w-5 mr-2" />
								Services
							</span>
						</li>
					</ol>
				</nav>
				
				{/* Professional Page Title */}
				<h1 className="text-3xl font-bold text-foreground mb-2">Service Marketplace</h1>
				<p className="text-muted-foreground">Discover and book trusted services from the UNIBEN community</p>
			</div>

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
		</div>
	);
}
