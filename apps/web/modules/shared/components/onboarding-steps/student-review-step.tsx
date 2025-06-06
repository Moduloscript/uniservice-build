import * as React from "react";

interface StudentReviewStepProps {
	form: any;
}

export function StudentReviewStep({ form }: StudentReviewStepProps) {
	return (
		<div className="space-y-2">
			<p>
				<span className="font-semibold">Role:</span> Student
			</p>
			<p>
				<strong>Matric Number:</strong> {form.getValues("matricNumber")}
			</p>
			<p>
				<strong>Department:</strong> {form.getValues("department")}
			</p>
			<p>
				<strong>Level:</strong> {form.getValues("level")}
			</p>
			<p>
				<strong>ID Card:</strong>{" "}
				{form.getValues("studentIdCard") ? "Uploaded" : "Not uploaded"}
			</p>
		</div>
	);
}
