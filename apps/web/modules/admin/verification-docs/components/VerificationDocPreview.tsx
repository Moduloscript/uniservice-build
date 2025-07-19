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
import { FileText, Download, ExternalLink, User, GraduationCap, Building2, Hash, Calendar, Eye, Loader2 } from "lucide-react";
import { cn } from "@ui/lib";
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
	const [studentIdCardUrl, setStudentIdCardUrl] = useState<string | null>(null);
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
			const secureUrl = await getSecureDownloadUrl("student-id-cards", doc.studentIdCardUrl);
			if (secureUrl) {
				setStudentIdCardUrl(secureUrl);
				// Open in new tab
				window.open(secureUrl, "_blank", "noopener,noreferrer");
			}
		} finally {
			setIsLoadingStudentId(false);
		}
	}, [doc.studentIdCardUrl, getSecureDownloadUrl, isLoadingStudentId]);

	return React.createElement(
		'div',
		{ className: "space-y-6" },
		React.createElement(
			Card,
			{ className: "border-primary/20" },
			React.createElement(
				CardHeader,
				null,
				React.createElement(
					'div',
					{ className: "flex items-start justify-between" },
					React.createElement(
						'div',
						{ className: "flex-1" },
						React.createElement(
							'div',
							{ className: "flex items-center gap-3 mb-3" },
							React.createElement(
								'div',
								{ className: "w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center" },
								userType === "STUDENT" 
									? React.createElement(GraduationCap, { className: "h-6 w-6 text-primary" })
									: React.createElement(Building2, { className: "h-6 w-6 text-primary" })
							),
							React.createElement(
								'div',
								null,
								React.createElement(CardTitle, { className: "text-xl" }, doc.userName),
								React.createElement(
									Badge,
									{ variant: "outline", className: "mt-1" },
									userType === "STUDENT" ? "Student" : "Service Provider"
								)
							)
						),
						React.createElement(Separator, { className: "my-4" }),
						React.createElement(
							'div',
							{ className: "grid grid-cols-1 md:grid-cols-2 gap-3" },
							React.createElement(
								'div',
								{ className: "flex items-center gap-2" },
								React.createElement(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
								React.createElement('span', { className: "text-sm font-medium text-muted-foreground" }, "Submitted:"),
								React.createElement(
									'span',
									{ className: "text-sm" },
									doc.submittedAt && !Number.isNaN(Date.parse(doc.submittedAt))
										? new Date(doc.submittedAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})
										: "-"
								)
							)
						)
					)
				)
			)
		),
		React.createElement(
			Card,
			null,
			React.createElement(
				CardHeader,
				null,
				React.createElement(
					CardTitle,
					{ className: "flex items-center gap-2" },
					React.createElement(FileText, { className: "h-5 w-5" }),
					"Submitted Documents"
				)
			),
			React.createElement(
				CardContent,
				{ className: "space-y-4" },
				React.createElement(
					'div',
					{ className: "rounded border bg-muted p-3 flex items-center justify-center min-h-[180px]" },
					documentUrl ? React.createElement(
						'div',
						{ className: "flex flex-col items-center gap-3" },
						React.createElement(FileText, { className: "h-12 w-12 text-muted-foreground" }),
						React.createElement(
							'div',
							{ className: "text-center" },
							React.createElement('p', { className: "font-medium text-sm mb-1" }, fileName),
							React.createElement(
								Button,
								{ variant: "outline", size: "sm", asChild: true },
								React.createElement(
									'a',
									{
										href: documentUrl,
										target: "_blank",
										rel: "noopener noreferrer"
									},
									React.createElement(Download, { className: "h-4 w-4 mr-2" }),
									"Download"
								)
							)
						)
					) : React.createElement(
						'div',
						{ className: "text-muted-foreground text-center w-full" },
						"No document available"
					)
				)
			)
		)
	);
};
