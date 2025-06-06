import React from "react";
import type { VerificationDoc } from "./VerificationDocsList";

interface VerificationDocPreviewProps {
	doc: VerificationDoc;
}

export const VerificationDocPreview: React.FC<VerificationDocPreviewProps> = ({
	doc,
}) => {
	const userType = doc.userType || doc.userRole || "";
	const documentUrl = doc.documentUrl || "";
	return (
		<div className="space-y-2">
			<div className="font-semibold">Document Preview</div>
			<div className="border rounded p-2 bg-muted">
				{/* Render image or PDF preview */}
				{documentUrl.match(/\.(jpg|jpeg|png)$/i) ? (
					<img
						src={`/api/secure-proxy?url=${encodeURIComponent(documentUrl)}`}
						alt="Verification Document"
						className="max-h-96 mx-auto"
					/>
				) : documentUrl.match(/\.pdf$/i) ? (
					<iframe
						src={`/api/secure-proxy?url=${encodeURIComponent(documentUrl)}`}
						title="Verification Document PDF"
						className="w-full h-96 border-none"
					/>
				) : (
					<div className="text-muted-foreground">
						Unsupported file type
					</div>
				)}
			</div>

			{/* User details */}
			<div className="space-y-1 text-sm">
				<div>
					<span className="font-medium">Name:</span> {doc.userName}
				</div>
				<div>
					<span className="font-medium">Role:</span> {doc.userRole}
				</div>
				{userType === "STUDENT" && (
					<>
						<div>
							<span className="font-medium">Matric Number:</span>{" "}
							{doc.matricNumber ?? "-"}
						</div>
						<div>
							<span className="font-medium">Department:</span>{" "}
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
								<a
									href={doc.studentIdCardUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 underline"
								>
									View
								</a>
							</div>
						)}
					</>
				)}
				{userType === "PROVIDER" && (
					<>
						<div>
							<span className="font-medium">Category:</span>{" "}
							{doc.providerCategory ?? "-"}
						</div>
						{doc.providerVerificationDocs &&
							Object.entries(doc.providerVerificationDocs).map(
								([key, url]) => (
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
										) : (
											<a
												href={url as string}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 underline"
											>
												View
											</a>
										)}
									</div>
								),
							)}
					</>
				)}
			</div>
			<div className="text-xs text-muted-foreground">
				Submitted:{" "}
				{doc.submittedAt
					? new Date(doc.submittedAt).toLocaleString()
					: "-"}
			</div>
		</div>
	);
};
