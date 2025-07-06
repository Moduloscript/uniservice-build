"use client";

import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { Input } from "@ui/components/input";
import { cn } from "@ui/lib";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	FilterIcon,
	SearchIcon,
	SlidersHorizontalIcon,
	XIcon,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { useCallback, useTransition } from "react";

const SORT_OPTIONS = {
	"submittedAt-desc": "Newest first",
	"submittedAt-asc": "Oldest first",
	"userName-asc": "Name A-Z",
	"userName-desc": "Name Z-A",
} as const;

const STATUS_OPTIONS = {
	PENDING: "Pending",
	APPROVED: "Approved",
	REJECTED: "Rejected",
	INCOMPLETE: "Incomplete",
} as const;

const USER_TYPE_OPTIONS = {
	STUDENT: "Student",
	PROVIDER: "Service Provider",
} as const;

export function VerificationDocFilters() {
	const [isPending, startTransition] = useTransition();
	const [search, setSearch] = useQueryState("search");
	const [sort, setSort] = useQueryState("sort");
	const [status, setStatus] = useQueryState("status");
	const [userType, setUserType] = useQueryState("userType");

	const handleSearch = useCallback(
		(value: string) => {
			startTransition(() => {
				void setSearch(value || null);
			});
		},
		[setSearch],
	);

	const handleSort = useCallback(
		(value: string | null) => {
			startTransition(() => {
				void setSort(value);
			});
		},
		[setSort],
	);

	const handleStatus = useCallback(
		(value: string | null) => {
			startTransition(() => {
				void setStatus(value);
			});
		},
		[setStatus],
	);

	const handleUserType = useCallback(
		(value: string | null) => {
			startTransition(() => {
				void setUserType(value);
			});
		},
		[setUserType],
	);

	const clearFilters = useCallback(() => {
		startTransition(() => {
			void setSearch(null);
			void setSort(null);
			void setStatus(null);
			void setUserType(null);
		});
	}, [setSearch, setSort, setStatus, setUserType]);

	const hasActiveFilters = search || sort || status || userType;

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-2">
				<div className="relative flex-1 sm:w-80">
					<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by name..."
						className="pl-9"
						value={search || ""}
						onChange={(e) => handleSearch(e.target.value)}
					/>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className={cn(status && "bg-primary/5")}
						>
							<FilterIcon className="h-4 w-4" />
							<span className="sr-only">Filter by status</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{Object.entries(STATUS_OPTIONS).map(
							([value, label]) => (
								<DropdownMenuItem
									key={value}
									className={cn(
										"cursor-pointer",
										status === value && "bg-primary/5",
									)}
									onClick={() =>
										handleStatus(
											status === value ? null : value,
										)
									}
								>
									{label}
									{status === value && (
										<XIcon className="ml-auto h-4 w-4 text-muted-foreground" />
									)}
								</DropdownMenuItem>
							),
						)}
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className={cn(userType && "bg-primary/5")}
						>
							<SlidersHorizontalIcon className="h-4 w-4" />
							<span className="sr-only">Filter by user type</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{Object.entries(USER_TYPE_OPTIONS).map(
							([value, label]) => (
								<DropdownMenuItem
									key={value}
									className={cn(
										"cursor-pointer",
										userType === value && "bg-primary/5",
									)}
									onClick={() =>
										handleUserType(
											userType === value ? null : value,
										)
									}
								>
									{label}
									{userType === value && (
										<XIcon className="ml-auto h-4 w-4 text-muted-foreground" />
									)}
								</DropdownMenuItem>
							),
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="flex items-center gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className={cn("gap-2", sort && "bg-primary/5")}
						>
							{sort?.includes("-desc") ? (
								<ArrowDownIcon className="h-4 w-4" />
							) : sort?.includes("-asc") ? (
								<ArrowUpIcon className="h-4 w-4" />
							) : null}
							{sort
								? SORT_OPTIONS[
										sort as keyof typeof SORT_OPTIONS
									]
								: "Sort by"}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuLabel>Sort by</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{Object.entries(SORT_OPTIONS).map(([value, label]) => (
							<DropdownMenuItem
								key={value}
								className={cn(
									"cursor-pointer",
									sort === value && "bg-primary/5",
								)}
								onClick={() =>
									handleSort(sort === value ? null : value)
								}
							>
								{label}
								{sort === value && (
									<XIcon className="ml-auto h-4 w-4 text-muted-foreground" />
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						className="gap-2"
						onClick={clearFilters}
					>
						<XIcon className="h-4 w-4" />
						Clear filters
					</Button>
				)}
			</div>
		</div>
	);
}
