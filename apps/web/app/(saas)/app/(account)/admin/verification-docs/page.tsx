"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { VerificationDocActions } from "../../../../../../modules/admin/verification-docs/components/VerificationDocActions";
import { VerificationDocPreview } from "../../../../../../modules/admin/verification-docs/components/VerificationDocPreview";
import type { VerificationDoc } from "../../../../../../modules/admin/verification-docs/components/VerificationDocsList";
import { VerificationDocsList } from "../../../../../../modules/admin/verification-docs/components/VerificationDocsList";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/components/select";
import { Badge } from "@ui/components/badge";
import { Separator } from "@ui/components/separator";
import { Search, Users, GraduationCap, Building2, Calendar, SortAsc, RefreshCw, FileCheck2, AlertCircle, ClipboardList, Filter, X, BarChart3 } from "lucide-react";
import { cn } from "@ui/lib";

const fetchPendingDocs = async (): Promise<VerificationDoc[]> => {
	try {
		const res = await fetch("/api/admin/verification-docs/pending");
		if (!res.ok) {
			throw new Error(`Failed to fetch pending docs: ${res.status} ${res.statusText}`);
		}
		const data = await res.json();
		// Ensure data and data.users exist and are arrays
		if (!data || !Array.isArray(data.users)) {
			console.warn('API returned invalid data structure:', data);
			return [];
		}
		// Transform API response to match VerificationDoc interface
		return data.users.map((user: any) => ({
			id: user?.id || Math.random().toString(36),
			userId: user?.id || '',
			userName: user?.name || 'Unknown User',
			userRole: user?.userType || 'Unknown',
			documentUrl: user?.verificationDoc || user?.studentIdCardUrl || '',
			submittedAt: user?.createdAt || new Date().toISOString(),
			status: user?.verificationStatus || 'PENDING',
			notes: user?.verificationNotes,
			userType: user?.userType,
			matricNumber: user?.matricNumber,
			department: user?.department,
			level: user?.level,
			providerCategory: user?.providerCategory,
			providerVerificationDocs: user?.providerVerificationDocs,
			studentIdCardUrl: user?.studentIdCardUrl,
		}));
	} catch (error) {
		console.error('Error fetching pending docs:', error);
		return [];
	}
};

const approveDoc = async ({
	docId,
	notes,
}: {
	docId: string;
	notes?: string;
}) => {
	const res = await fetch(`/api/admin/verification-docs/${docId}/approve`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ notes }),
	});
	if (!res.ok) {
		throw new Error("Failed to approve document");
	}
};

const rejectDoc = async ({
	docId,
	notes,
}: {
	docId: string;
	notes?: string;
}) => {
	const res = await fetch(`/api/admin/verification-docs/${docId}/reject`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ notes }),
	});
	if (!res.ok) {
		throw new Error("Failed to reject document");
	}
};

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
			<FileCheck2 className="h-12 w-12 mb-4 text-muted-foreground" />
			<p className="text-lg font-medium">No pending verifications</p>
			<p className="text-sm">
				All onboarding requests have been reviewed.
			</p>
		</div>
	);
}

function LoadingOverlay() {
	return (
		<div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
			<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
		</div>
	);
}

const AdminVerificationDocsPage: React.FC = () => {
	const queryClient = useQueryClient();
	const [selected, setSelected] = useState<VerificationDoc | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<"all" | "student" | "provider">("all");
	const [sortBy, setSortBy] = useState<"date" | "name" | "type">("date");

	const {
		data: docs = [],
		isLoading: isFetching,
		error,
	} = useQuery<VerificationDoc[], Error>({
		queryKey: ["pending-verification-docs"],
		queryFn: fetchPendingDocs,
	});

	const approveMutation = useMutation({
		mutationFn: approveDoc,
		onSuccess: () => {
			setSuccess("Document approved");
			queryClient.invalidateQueries({
				queryKey: ["pending-verification-docs"],
			});
			setSelected(null);
		},
	});

	const rejectMutation = useMutation({
		mutationFn: rejectDoc,
		onSuccess: () => {
			setSuccess("Document rejected");
			queryClient.invalidateQueries({
				queryKey: ["pending-verification-docs"],
			});
			setSelected(null);
		},
	});

	const handleApprove = async (docId: string, notes?: string): Promise<void> => {
		setSuccess(null);
		await approveMutation.mutateAsync({ docId, notes });
	};

	const handleReject = async (docId: string, notes?: string): Promise<void> => {
		setSuccess(null);
		await rejectMutation.mutateAsync({ docId, notes });
	};

	// Filter documents based on search and filter type
	const filteredDocs = docs.filter(doc => {
		const matchesSearch = searchTerm === "" || 
			doc.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(doc.matricNumber && doc.matricNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(doc.department && doc.department.toLowerCase().includes(searchTerm.toLowerCase()));
		
		const matchesFilter = filterType === "all" ||
			(filterType === "student" && doc.userType === "STUDENT") ||
			(filterType === "provider" && doc.userType === "PROVIDER");
		
		return matchesSearch && matchesFilter;
	});
	
	// Apply sorting to filtered documents
	const sortedDocs = [...filteredDocs].sort((a, b) => {
		if (sortBy === "date") {
			return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
		} else if (sortBy === "name") {
			return a.userName.localeCompare(b.userName);
		} else if (sortBy === "type") {
			return (a.userType || "").localeCompare(b.userType || "");
		}
		return 0;
	});

	return (
		<div className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 md:py-8 md:px-8 lg:py-12 lg:px-12 relative">
			<h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 md:mb-8">
				Verification Document Review
			</h1>
			{(error || approveMutation.error || rejectMutation.error) && (
				<div className="mb-4">
					<div className="bg-red-100 text-red-700 rounded px-4 py-2">
						{error?.message ||
							approveMutation.error?.message ||
							rejectMutation.error?.message}
					</div>
				</div>
			)}
			{success && (
				<div className="mb-4">
					<div className="bg-green-100 text-green-700 rounded px-4 py-2">
						{success}
					</div>
				</div>
			)}
    <div className="flex flex-col space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header with Filters and Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="order-2 lg:order-1">
                {/* Filters and Search Components */}
                <Card className="py-6 px-6">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                        {/* Filter Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <Select value={filterType} onValueChange={(value: "all" | "student" | "provider") => setFilterType(value)}>
                                    <SelectTrigger className="w-full sm:w-44">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                All Users
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="student">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4" />
                                                Students Only
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="provider">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                Providers Only
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                <Select value={sortBy} onValueChange={(value: "date" | "name" | "type") => setSortBy(value)}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Sort by Date
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="name">
                                            <div className="flex items-center gap-2">
                                                <SortAsc className="h-4 w-4" />
                                                Sort by Name
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="type">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Sort by Type
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                {/* Quick Reset Button */}
                                {(filterType !== "all" || searchTerm !== "") && (
                                    <Button
                                        variant="outline"
                                        size="mobile"
                                        onClick={() => { setFilterType("all"); setSearchTerm(""); }}
                                        className="text-sm font-medium min-w-[80px] sm:min-w-[60px]"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Reset
                                    </Button>
                                )}
                            </div>
                            
                            {/* Search Section */}
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search names, matric numbers, departments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                                {searchTerm && (
                                    <Button
                                        variant="ghost"
                                        size="mobile"
                                        onClick={() => setSearchTerm("")}
                                        className="px-3 min-w-[44px] hover:bg-gray-100"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col justify-center">
                {/* Status Overview */}
                <Card className="py-6 px-6">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Status Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{docs.length}</div>
                                <div className="text-xs text-muted-foreground">Total Pending</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {docs.filter(doc => doc.userType === "STUDENT").length}
                                </div>
                                <div className="text-xs text-muted-foreground">Students</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {docs.filter(doc => doc.userType === "PROVIDER").length}
                                </div>
                                <div className="text-xs text-muted-foreground">Providers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">{filteredDocs.length}</div>
                                <div className="text-xs text-muted-foreground">Filtered</div>
                            </div>
                        </div>
                        
                        {selected && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="text-sm font-medium mb-2">Selected Document</div>
                                <div className="text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="h-3 w-3" />
                                        {selected.userName}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                            {selected.userType === "STUDENT" ? "Student" : "Provider"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
        {/* Document Queue Panel */}
        <Card className="py-6 px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <ClipboardList className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Document Queue</h2>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                        <BarChart3 className="h-3 w-3 mr-2" />
                        {filteredDocs.length} showing
                    </Badge>
                    {docs.length !== filteredDocs.length && (
                        <span className="text-xs text-muted-foreground">of {docs.length} total</span>
                    )}
                </div>
            </div>
        </Card>
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 min-h-[400px] sm:min-h-[500px]">
            <div className="lg:col-span-1 relative">
                <div className="sticky top-4 sm:top-24">
                    {isFetching ? (
                        <LoadingOverlay />
                    ) : filteredDocs.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <VerificationDocsList docs={sortedDocs} onSelect={setSelected} />
                    )}
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="relative min-h-[400px]">
                    {(approveMutation.isPending ||
                        rejectMutation.isPending) && <LoadingOverlay />}
                    {selected ? (
                        <div className="space-y-6">
                            <VerificationDocPreview doc={selected} />
                            <VerificationDocActions
                                doc={selected}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                loading={
                                    approveMutation.isPending ||
                                    rejectMutation.isPending
                                }
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                            <AlertCircle className="h-12 w-12 mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium">
                                Select a document to review
                            </p>
                            <p className="text-sm">
                                Click a user from the list to view details
                                and take action.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
		</div>
	);
};

export default AdminVerificationDocsPage;
