import { Card, CardContent } from "@ui/components/card";
import { Skeleton } from "@ui/components/skeleton";

export function VerificationDocListSkeleton() {
	// Generate 3 skeleton items for a clean loading state
	return (
		<div className="space-y-3">
			{Array.from({ length: 3 }).map((_, index) => (
				<Card key={index} className="overflow-hidden">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4 flex-1">
								{/* Status indicator */}
								<Skeleton className="h-4 w-20" />

								{/* User info */}
								<div className="space-y-2 flex-1">
									<Skeleton className="h-5 w-48" />
									<Skeleton className="h-4 w-32" />
								</div>
							</div>

							{/* Action buttons */}
							<div className="flex items-center gap-2">
								<Skeleton className="h-9 w-20" />
								<Skeleton className="h-9 w-9 rounded-md" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
