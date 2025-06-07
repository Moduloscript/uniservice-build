"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { VerificationDocActions } from "../../../../../../modules/admin/verification-docs/components/VerificationDocActions";
import { VerificationDocPreview } from "../../../../../../modules/admin/verification-docs/components/VerificationDocPreview";
import type { VerificationDoc } from "../../../../../../modules/admin/verification-docs/components/VerificationDocsList";
import { VerificationDocsList } from "../../../../../../modules/admin/verification-docs/components/VerificationDocsList";

const fetchPendingDocs = async (): Promise<VerificationDoc[]> => {
	const res = await fetch("/api/admin/verification-docs/pending");
	if (!res.ok) {
		throw new Error("Failed to fetch pending docs");
	}
	const data = await res.json();
	return data.users ?? [];
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
			<span className="text-4xl mb-2">📄</span>
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

	const handleApprove = (docId: string, notes?: string) => {
		setSuccess(null);
		approveMutation.mutate({ docId, notes });
	};

	const handleReject = (docId: string, notes?: string) => {
		setSuccess(null);
		rejectMutation.mutate({ docId, notes });
	};

	return (
		<div className="max-w-6xl mx-auto py-8 px-2 md:px-4 relative">
			<h1 className="text-2xl font-bold mb-6">
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
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[500px]">
				<div className="md:col-span-1 relative">
					<div className="sticky top-24">
						{isFetching ? (
							<LoadingOverlay />
						) : docs.length === 0 ? (
							<EmptyState />
						) : (
							<VerificationDocsList
								docs={docs}
								onSelect={setSelected}
							/>
						)}
					</div>
				</div>
				<div className="md:col-span-2">
					<div className="relative min-h-[400px]">
						{(approveMutation.isPending ||
							rejectMutation.isPending) && <LoadingOverlay />}
						{selected ? (
							<div className="bg-white rounded-lg shadow p-6 space-y-4 border">
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
								<span className="text-3xl mb-2">👈</span>
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
	);
};

export default AdminVerificationDocsPage;
