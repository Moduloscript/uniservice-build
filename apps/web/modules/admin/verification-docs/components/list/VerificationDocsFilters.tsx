"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";

export function VerificationDocsFilters() {
	const [status, setStatus] = useQueryState("status");
	const [userType, setUserType] = useQueryState("userType");
	const [search, setSearch] = useQueryState("search");
	const [searchInput, setSearchInput] = useState(search || "");

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		void setSearch(searchInput || null);
	};

	return (
		<div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
			<div className="flex flex-1 gap-4">
				<form onSubmit={handleSearch} className="flex-1 md:max-w-xs">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search documents..."
							className="pl-8"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
					</div>
				</form>

				<Select
					value={status || ""}
					onValueChange={(value) => void setStatus(value || null)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All Status</SelectItem>
						<SelectItem value="PENDING">Pending</SelectItem>
						<SelectItem value="APPROVED">Approved</SelectItem>
						<SelectItem value="REJECTED">Rejected</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={userType || ""}
					onValueChange={(value) => void setUserType(value || null)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All Types</SelectItem>
						<SelectItem value="STUDENT">Student</SelectItem>
						<SelectItem value="PROVIDER">Provider</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Button
				variant="outline"
				onClick={() => {
					void setStatus(null);
					void setUserType(null);
					void setSearch(null);
					setSearchInput("");
				}}
			>
				Reset Filters
			</Button>
		</div>
	);
}
