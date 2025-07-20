"use client";
import { fetchVerificationDocs } from "@lib/fetch-verification-docs";
import { useQuery } from "@tanstack/react-query";
import { STATUS_COLORS, type VerificationDoc } from "@types";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader } from "@ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { cn } from "@ui/lib";
import { CalendarIcon, EyeIcon, MoreVerticalIcon, UserIcon } from "lucide-react";
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
		<Card className="hover:shadow-md transition-shadow duration-200">
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-4 flex-1">
						<StatusBadge status={doc.status.state} />

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-2">
								<UserIcon className="size-4 text-muted-foreground" />
								<h3 className="font-semibold text-lg truncate">{doc.userName}</h3>
							</div>
							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								<span className="flex items-center gap-1">
									<UserIcon className="size-3" />
									{doc.userType}
								</span>
								<span className="flex items-center gap-1">
									<CalendarIcon className="size-3" />
									Submitted {new Date(doc.submittedAt).toLocaleDateString()}
								</span>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" className="flex items-center gap-2">
							<EyeIcon className="size-4" />
							View Details
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="w-9 p-0">
									<MoreVerticalIcon className="size-4" />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem>
									<EyeIcon className="mr-2 size-4" />
									View Details
								</DropdownMenuItem>
								<DropdownMenuItem>
									Edit
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
