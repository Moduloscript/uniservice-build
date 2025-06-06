import * as React from "react";

interface ProviderReviewStepProps {
	form: any;
	providerCategory: string;
	CATEGORY_VERIFICATION_REQUIREMENTS: Record<string, any>;
}

export function ProviderReviewStep({
	form,
	providerCategory,
	CATEGORY_VERIFICATION_REQUIREMENTS,
}: ProviderReviewStepProps) {
	return (
		<div className="space-y-2">
			<p>
				<strong>Role:</strong> Service Provider
			</p>
			<p>
				<strong>Category:</strong>{" "}
				{
					CATEGORY_VERIFICATION_REQUIREMENTS[
						form.getValues("providerCategory") as string
					]?.label
				}
			</p>
			<p>
				<strong>Required Documents:</strong>
			</p>
			<ul className="list-disc pl-5">
				{providerCategory &&
					CATEGORY_VERIFICATION_REQUIREMENTS[
						providerCategory
					]?.requiredDocuments.map((doc: any) => (
						<li key={doc.key}>
							{doc.label}:{" "}
							{form.getValues(`providerDocs.${doc.key}`)
								? "Uploaded"
								: "Not uploaded"}
						</li>
					))}
			</ul>
		</div>
	);
}
