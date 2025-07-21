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
import { FileText, Download, GraduationCap, Building2, Calendar } from "lucide-react";
import type { VerificationDoc } from "./VerificationDocsList";

interface VerificationDocPreviewProps {
	doc: VerificationDoc;
}

export const VerificationDocPreview: React.FC<VerificationDocPreviewProps> = ({
	doc,
}) => {
	const userType = doc.userType || doc.userRole || "";
	const documentUrl = doc.documentUrl || "";
	const fileName = documentUrl.split("/").pop() || "Document";
	const [isLoadingStudentId, setIsLoadingStudentId] = useState(false);

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
					<div className="rounded border bg-muted p-3 min-h-[180px]">
						{documentUrl ? (
							<div className="flex flex-col items-center gap-3 w-full">
								<FileText className="h-12 w-12 text-muted-foreground" />
								<div className="text-center w-full">
									<p className="font-medium text-sm mb-3">{fileName}</p>
									{documentUrl.match(/\.(pdf|jpg|png)$/) ? (
										<div className="mb-4 w-full">
											{documentUrl.endsWith(".pdf") ? (
												<iframe
													src={`/api/files/${userType === "STUDENT" ? "student-id-cards" : "verification-docs"}/${documentUrl}`}
													width="100%"
													height="400px"
													className="border rounded"
													title="Document Preview"
												/>
											) : (
												<img
													src={`/api/files/${userType === "STUDENT" ? "student-id-cards" : "verification-docs"}/${documentUrl}`}
													alt="Document Preview"
													className="max-w-full h-auto border rounded mx-auto"
												/>
											)}
										</div>
									) : (
										<p className="text-muted-foreground mb-4">Preview not available for this file type</p>
									)}
									<Button variant="outline" size="sm" asChild>
										<a
											href={`/api/files/${userType === "STUDENT" ? "student-id-cards" : "verification-docs"}/${documentUrl}`}
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
