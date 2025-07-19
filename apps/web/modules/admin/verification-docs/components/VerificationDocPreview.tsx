import { FileTextIcon } from "@radix-ui/react-icons";
import React, { useState, useCallback } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../ui/components/card";
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

	return (
		<Card className="w-full max-w-2xl mx-auto border bg-white/90 shadow-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-semibold text-primary">
					Document Preview
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded border bg-muted p-3 flex items-center justify-center min-h-[180px]">
					{/* Render image or PDF preview, otherwise show download link */}
					{documentUrl.match(/\.(jpg|jpeg|png)$/i) ? (
						<img
							src={`/api/secure-proxy?url=${encodeURIComponent(documentUrl)}`}
							alt="Verification Document"
							className="max-h-80 rounded shadow object-contain"
							loading="lazy"
						/>
					) : documentUrl.match(/\.pdf$/i) ? (
						<iframe
							src={`/api/secure-proxy?url=${encodeURIComponent(documentUrl)}`}
							title="Verification Document PDF"
							className="w-full h-80 border-none rounded"
						/>
					) : documentUrl ? (
						<div className="flex items-center gap-2 text-muted-foreground">
							<FileTextIcon
								className="w-5 h-5"
								aria-hidden="true"
							/>
							<span
								className="truncate max-w-xs"
								title={fileName}
							>
								{fileName}
							</span>
							<a
								href={documentUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 underline ml-2"
								aria-label={`Download ${fileName}`}
							>
								Download
							</a>
						</div>
					) : (
						<div className="text-muted-foreground text-center w-full">
							No document available
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div className="space-y-1">
						<div>
							<span className="font-medium">Name:</span>{" "}
							{doc.userName}
						</div>
						<div>
							<span className="font-medium">Role:</span>{" "}
							{doc.userRole}
						</div>
						{userType === "STUDENT" && (
							<React.Fragment>
								<div>
									<span className="font-medium">
										Matric Number:
									</span>{" "}
									{doc.matricNumber ?? "-"}
								</div>
								<div>
									<span className="font-medium">
										Department:
									</span>{" "}
									{doc.department ?? "-"}
								</div>
								<div>
									<span className="font-medium">Level:</span>{" "}
									{doc.level ?? "-"}
								</div>
								{doc.studentIdCardUrl && (
									<div>
										<span className="font-medium">
											Student ID Card:
										</span>{" "}
										<button
											type="button"
											onClick={handleStudentIdCardView}
											disabled={isLoadingStudentId}
											className="text-blue-600 underline hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isLoadingStudentId ? "Loading..." : "View"}
										</button>
									</div>
								)}
							</React.Fragment>
						)}
						{userType === "PROVIDER" && (
							<React.Fragment>
								<div>
									<span className="font-medium">
										Category:
									</span>{" "}
									{doc.providerCategory ?? "-"}
								</div>
								{doc.providerVerificationDocs &&
									Object.entries(
										doc.providerVerificationDocs,
									).map(([key, url]) => (
										<div key={key} className="mb-2">
											<span className="font-medium">
												{key}:
											</span>{" "}
											{typeof url === "string" &&
											url.match(/\.(jpg|jpeg|png)$/i) ? (
												<a
													href={url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 underline"
												>
													<img
														src={url}
														alt={key}
														className="inline-block h-16 max-w-xs mr-2 align-middle border rounded"
														loading="lazy"
													/>
													View
												</a>
											) : typeof url === "string" &&
											  url.match(/\.pdf$/i) ? (
												<a
													href={url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 underline"
												>
													PDF
												</a>
											) : typeof url === "string" ? (
												<span className="flex items-center gap-2 text-muted-foreground">
													<FileTextIcon
														className="w-4 h-4"
														aria-hidden="true"
													/>
													<span
														className="truncate max-w-xs"
														title={
															url
																.split("/")
																.pop() || key
														}
													>
														{url.split("/").pop() ||
															key}
													</span>
													<a
														href={url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-600 underline ml-2"
														aria-label={`Download ${url.split("/").pop() || key}`}
													>
														Download
													</a>
												</span>
											) : (
												<span className="text-muted-foreground">
													No document available
												</span>
											)}
										</div>
									))}
							</React.Fragment>
						)}
					</div>
					<div className="flex flex-col justify-end items-end">
						<div className="text-xs text-muted-foreground mt-2">
							<span className="font-medium">Submitted:</span>{" "}
							{doc.submittedAt &&
							!Number.isNaN(Date.parse(doc.submittedAt))
								? new Date(doc.submittedAt).toLocaleString()
								: "-"}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
