import { Link, Text } from "@react-email/components";
import React from "react";
import { createTranslator } from "use-intl/core";
import PrimaryButton from "../src/components/PrimaryButton";
import Wrapper from "../src/components/Wrapper";
import { defaultTranslations } from "../src/util/translations";
import { defaultLocale } from "../src/util/translations";
import type { BaseMailProps } from "../types";

export function EarningsNotification({
	name,
	serviceName,
	clientName,
	earningsAmount,
	totalAmount,
	platformFee,
	dashboardUrl,
	locale,
	translations,
}: {
	name: string;
	serviceName: string;
	clientName: string;
	earningsAmount: string;
	totalAmount: string;
	platformFee: string;
	dashboardUrl: string;
} & BaseMailProps) {
	const t = createTranslator({
		locale,
		messages: translations,
	});

	return (
		<Wrapper>
			<Text className="text-2xl font-bold text-green-600 mb-4">
				💰 New Earnings Available!
			</Text>

			<Text>Hi {name},</Text>

			<Text>
				Great news! You've earned money from a completed booking. Here are
				the details:
			</Text>

			<div style={{ 
				background: "#f8f9fa", 
				padding: "16px", 
				borderRadius: "8px", 
				margin: "16px 0" 
			}}>
				<Text style={{ margin: "4px 0", fontWeight: "600" }}>
					Service: {serviceName}
				</Text>
				<Text style={{ margin: "4px 0" }}>
					Client: {clientName}
				</Text>
				<Text style={{ margin: "4px 0" }}>
					Total Payment: ₦{totalAmount}
				</Text>
				<Text style={{ margin: "4px 0" }}>
					Platform Fee: ₦{platformFee}
				</Text>
				<Text style={{ 
					margin: "4px 0", 
					fontWeight: "700", 
					color: "#16a34a",
					fontSize: "18px"
				}}>
					Your Earnings: ₦{earningsAmount}
				</Text>
			</div>

			<Text>
				Your earnings have been added to your account balance and will be
				included in your next payout cycle.
			</Text>

			<PrimaryButton href={dashboardUrl}>
				View Earnings Dashboard →
			</PrimaryButton>

			<Text className="text-muted-foreground text-sm mt-6">
				You can track all your earnings and payout history in your
				provider dashboard. Keep up the great work!
			</Text>

			<Text className="text-muted-foreground text-sm">
				If you can't click the button above, copy and paste this link
				into your browser:
				<br />
				<Link href={dashboardUrl}>{dashboardUrl}</Link>
			</Text>
		</Wrapper>
	);
}

EarningsNotification.PreviewProps = {
	locale: defaultLocale,
	translations: defaultTranslations,
	name: "John Doe",
	serviceName: "Home Cleaning Service",
	clientName: "Jane Smith",
	earningsAmount: "4,500.00",
	totalAmount: "5,000.00",
	platformFee: "500.00",
	dashboardUrl: "https://example.com/provider/earnings",
};

export default EarningsNotification;
