import { Link, Text } from "@react-email/components";
import React from "react";
import { createTranslator } from "use-intl/core";
import PrimaryButton from "../src/components/PrimaryButton";
import Wrapper from "../src/components/Wrapper";
import { defaultTranslations } from "../src/util/translations";
import { defaultLocale } from "../src/util/translations";
import type { BaseMailProps } from "../types";

export function VerificationRejected({
	name,
	notes,
	resubmitUrl,
	locale,
	translations,
}: {
	name: string;
	notes?: string;
	resubmitUrl: string;
} & BaseMailProps) {
	const t = createTranslator({
		locale,
		messages: translations,
	});

	return (
		<Wrapper>
			<Text className="text-2xl font-bold text-red-600 mb-4">
				⚠️ Verification Update Required
			</Text>

			<Text>Hi {name},</Text>

			<Text>
				We've reviewed your account verification, but we need you to
				update some information before we can approve your account.
			</Text>

			{notes && (
				<div className="bg-yellow-50 border border-yellow-200 rounded p-4 my-4">
					<Text className="font-semibold text-yellow-800 mb-2">
						Feedback from our review team:
					</Text>
					<Text className="text-yellow-700 text-sm">{notes}</Text>
				</div>
			)}

			<Text>
				Please review the feedback above and update your information
				accordingly. Common issues include:
				<ul>
					<li>• Unclear or missing documentation</li>
					<li>• Information that doesn't match your profile</li>
					<li>• Missing required fields</li>
				</ul>
			</Text>

			<PrimaryButton href={resubmitUrl}>
				Update My Information &rarr;
			</PrimaryButton>

			<Text className="text-muted-foreground text-sm mt-6">
				Don't worry - this is a common part of the verification process.
				Once you update your information, our team will review it
				promptly.
			</Text>

			<Text className="text-muted-foreground text-sm">
				Need help? Contact our support team or visit our FAQ section.
			</Text>

			<Text className="text-muted-foreground text-sm">
				If you can't click the button above, copy and paste this link
				into your browser:
				<br />
				<Link href={resubmitUrl}>{resubmitUrl}</Link>
			</Text>
		</Wrapper>
	);
}

VerificationRejected.PreviewProps = {
	locale: defaultLocale,
	translations: defaultTranslations,
	name: "John Doe",
	notes: "Please provide a clearer photo of your student ID card.",
	resubmitUrl: "https://example.com/app/onboarding",
};

export default VerificationRejected;
