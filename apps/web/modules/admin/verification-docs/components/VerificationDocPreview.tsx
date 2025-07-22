import React, { useState, useCallback } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Separator } from "@ui/components/separator";
import { FileText, Download, GraduationCap, Building2, Calendar, AlertCircle } from "lucide-react";
import type { VerificationDoc } from "./VerificationDocsList";

interface VerificationDocPreviewProps {
	doc: VerificationDoc;
}

export const VerificationDocPreview: React.FC<VerificationDocPreviewProps> = ({
	doc,
}) => {
	const userType = doc.userType || doc.userRole || "";
	
	// Get all available documents
	const getAvailableDocuments = () => {
		const documents = [];
		
		// Add primary verification document if available
		if (doc.documentUrl || doc.verificationDoc) {
			documents.push({
				url: doc.documentUrl || doc.verificationDoc,
				type: 'verification',
				name: 'Verification Document',
				bucket: 'verification-docs'
			});
		}
		
		// Add student ID card if available
		if (doc.studentIdCardUrl) {
			documents.push({
				url: doc.studentIdCardUrl,
				type: 'student-id',
				name: 'Student ID Card',
				bucket: 'student-id-cards'
			});
		}
		
		// Add provider verification documents if available
		if (doc.providerVerificationDocs && typeof doc.providerVerificationDocs === 'object') {
			Object.entries(doc.providerVerificationDocs).forEach(([key, url]) => {
				if (url && typeof url === 'string') {
					documents.push({
						url: url,
						type: 'provider-verification',
						name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
						bucket: 'verification-docs'
					});
				}
			});
		}
		
		return documents;
	};
	
	const availableDocuments = getAvailableDocuments();
	
	// State for managing which document is currently selected
	const [selectedDocIndex, setSelectedDocIndex] = useState(0);
	const [isLoadingStudentId, setIsLoadingStudentId] = useState(false);
	const [previewError, setPreviewError] = useState<string | null>(null);
	const [iframeError, setIframeError] = useState(false);
	
	// Get current document info
	const currentDocument = availableDocuments[selectedDocIndex];
	const documentUrl = currentDocument?.url || "";
	const fileName = documentUrl ? documentUrl.split("/").pop() || "Document" : "No Document";
	const bucketName = currentDocument?.bucket || "verification-docs";

	const getSecureDownloadUrl = useCallback(async (bucket: string, path: string) => {
		try {
			const response = await fetch("/api/downloads/signed-url", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ bucket, path }),
			});

			if (!response.ok) {
				throw new Error("Failed to get secure download URL");
			}

			const data = await response.json();
			return data.signedUrl;
		} catch (error) {
			console.error("Error getting secure download URL:", error);
			return null;
		}
	}, []);

	const handleStudentIdCardView = useCallback(async () => {
		if (!doc.studentIdCardUrl || isLoadingStudentId) return;

		setIsLoadingStudentId(true);
		try {
			const secureUrl = await getSecureDownloadUrl(
				"student-id-cards",
				doc.studentIdCardUrl
			);
			if (secureUrl) {
				window.open(secureUrl, "_blank", "noopener,noreferrer");
			}
		} finally {
			setIsLoadingStudentId(false);
		}
	}, [doc.studentIdCardUrl, getSecureDownloadUrl, isLoadingStudentId]);

	return (
		<div className="space-y-6">
			<Card className="border-primary/20">
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
									{userType === "STUDENT" ? (
										<GraduationCap className="h-6 w-6 text-primary" />
									) : (
										<Building2 className="h-6 w-6 text-primary" />
									)}
								</div>
								<div>
									<CardTitle className="text-xl">{doc.userName}</CardTitle>
									<Badge variant="outline" className="mt-1">
										{userType === "STUDENT" ? "Student" : "Service Provider"}
									</Badge>
								</div>
							</div>
							<Separator className="my-4" />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium text-muted-foreground">
										Submitted:
									</span>
									<span className="text-sm">
										{doc.submittedAt &&
										!Number.isNaN(Date.parse(doc.submittedAt))
											? new Date(doc.submittedAt).toLocaleDateString("en-US", {
													year: "numeric",
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})
											: "-"}
									</span>
								</div>
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Submitted Documents
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Document selector for multiple documents */}
					{availableDocuments.length > 1 && (
						<div className="flex flex-wrap gap-2 mb-4">
							{availableDocuments.map((document, index) => (
								<Button
									key={index}
									variant={index === selectedDocIndex ? "default" : "outline"}
									size="sm"
									onClick={() => {
										setSelectedDocIndex(index);
										setPreviewError(null);
									}}
									className="text-xs"
								>
									{document.name}
								</Button>
							))}
						</div>
					)}
					
					{/* Document count indicator */}
					{availableDocuments.length > 0 && (
						<div className="text-xs text-muted-foreground mb-2 text-center">
							{availableDocuments.length > 1 
								? `Document ${selectedDocIndex + 1} of ${availableDocuments.length}` 
								: `1 Document Available`
							}
						</div>
					)}
					
					<div className="rounded border bg-muted p-3 min-h-[180px]">
						{availableDocuments.length > 0 && currentDocument ? (
							<div className="flex flex-col items-center gap-3 w-full">
								<FileText className="h-12 w-12 text-muted-foreground" />
								<div className="text-center w-full">
									<p className="font-medium text-sm mb-3">{fileName}</p>
									{documentUrl.match(/\.(pdf|jpg|png)$/) ? (
										<div className="mb-4 w-full">
											{previewError ? (
												<div className="flex flex-col items-center justify-center h-32 text-muted-foreground border rounded">
													<AlertCircle className="h-8 w-8 mb-2" />
													<p className="text-sm">Failed to load preview</p>
													<p className="text-xs">{previewError}</p>
												</div>
											) : documentUrl.endsWith(".pdf") ? (
												<div className="relative">
													<iframe
														src={`/api/files/${bucketName}/${documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
														width="100%"
														height="400px"
														className="border rounded"
														title="Document Preview"
														onLoad={() => setPreviewError(null)}
														onError={() => setPreviewError('PDF could not be loaded. Please try downloading the file.')}
													/>
													<div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
														PDF Preview
													</div>
												</div>
											) : (
												<img
													src={`/api/files/${bucketName}/${documentUrl}`}
													alt="Document Preview"
													className="max-w-full h-auto border rounded mx-auto"
													onLoad={() => setPreviewError(null)}
													onError={() => setPreviewError('Image could not be loaded. Please try downloading the file.')}
												/>
											)}
										</div>
									) : (
										<p className="text-muted-foreground mb-4">Preview not available for this file type</p>
									)}
									<Button variant="outline" size="sm" asChild>
										<a
											href={`/api/files/${bucketName}/${documentUrl}`}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Download className="h-4 w-4 mr-2" />
											Download
										</a>
									</Button>
								</div>
							</div>
						) : (
							<div className="text-muted-foreground text-center w-full flex items-center justify-center h-full">
								No document available
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
