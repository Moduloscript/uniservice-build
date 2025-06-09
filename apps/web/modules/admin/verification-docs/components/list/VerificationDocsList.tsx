"use client";
import { fetchVerificationDocs } from "@lib/fetch-verification-docs";
import { useQuery } from "@tanstack/react-query";
import { STATUS_COLORS, type VerificationDoc } from "@types";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card, CardContent } from "@ui/components/card";
import { cn } from "@ui/lib";
import { useQueryState } from "nuqs";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { VerificationDocListEmpty } from "./VerificationDocListEmpty";
import { VerificationDocListSkeleton } from "./VerificationDocListSkeleton";

export function VerificationDocsList() {
	const [status] = useQueryState("status");
	const [userType] = useQueryState("userType");
	const [search] = useQueryState("search");
	const [page] = useQueryState("page", { defaultValue: "1" });

	const { data, error, isLoading } = useQuery({
		queryKey: ["verification-docs", { status, userType, search, page }],
		queryFn: () =>
			fetchVerificationDocs({
				status,
				userType,
				search,
				page: Number(page),
			}),
	});

	if (isLoading) {
		return <VerificationDocListSkeleton />;
	}
	if (error) {
		return <ErrorBoundary error={error} reset={() => void 0} />;
	}
	if (!data?.docs.length) {
		return <VerificationDocListEmpty />;
	}

	return (
		<div className="space-y-4">
			{data.docs.map((doc) => (
				<VerificationDocItem key={doc.id} doc={doc} />
			))}
		</div>
	);
}

interface StatusBadgeProps {
	variant?: "default" | "outline" | "secondary" | "destructive";
	status: "PENDING" | "APPROVED" | "REJECTED" | "INCOMPLETE";
	className?: string;
}

function StatusBadge({ status, className }: Omit<StatusBadgeProps, "variant">) {
	return (
		<Badge className={cn(STATUS_COLORS[status], "text-white", className)}>
			{status}
		</Badge>
	);
}

function VerificationDocItem({ doc }: { doc: VerificationDoc }) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<StatusBadge status={doc.status.state} />

						<div>
							<h3 className="font-medium">{doc.userName}</h3>
							<p className="text-sm text-muted-foreground">
								{doc.userType} • Submitted{" "}
								{new Date(doc.submittedAt).toLocaleDateString()}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							View Details
						</Button>
						<Button variant="outline" size="sm" className="w-9 p-0">
							⋮
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
