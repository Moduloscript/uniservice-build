"use client";

import { Badge } from "../../ui/components/badge";
import { Button } from "../../ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/components/card";
import { 
	Mail, 
	Calendar, 
	Shield, 
	GraduationCap, 
	Building2, 
	Star,
	CheckCircle 
} from "lucide-react";
import type { Service } from "../types";

interface ProviderInfoProps {
	provider: NonNullable<Service["provider"]>;
}

export function ProviderInfo({ provider }: ProviderInfoProps) {
	// Format join date
	const formatJoinDate = (dateString?: string) => {
		if (!dateString) return "Unknown";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long"
		});
	};

	// Determine verification status
	const getVerificationStatus = () => {
		if (provider.isVerified || provider.verified) {
			return {
				label: "Verified Provider",
				variant: "default" as const,
				icon: <CheckCircle className="h-4 w-4" />
			};
		}
		if (provider.verificationStatus === "PENDING") {
			return {
				label: "Verification Pending",
				variant: "secondary" as const,
				icon: <Shield className="h-4 w-4" />
			};
		}
		return {
			label: "Unverified",
			variant: "outline" as const,
			icon: <Shield className="h-4 w-4" />
		};
	};

	const verificationInfo = getVerificationStatus();

	// Format user type
	const formatUserType = (userType?: string) => {
		if (!userType) return "Provider";
		return userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase();
	};

	return (
		<Card className="w-full">
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-lg">
					<GraduationCap className="h-5 w-5 text-primary" />
					Provider Information
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Provider Name & Verification */}
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-semibold text-lg text-foreground">
							{provider.name}
						</h3>
						<p className="text-sm text-muted-foreground">
							{formatUserType(provider.userType)}
						</p>
					</div>
					<Badge 
						variant={verificationInfo.variant}
						className="flex items-center gap-1"
					>
						{verificationInfo.icon}
						{verificationInfo.label}
					</Badge>
				</div>

				{/* University Information */}
				{provider.department && (
					<div className="flex items-center gap-2 text-sm">
						<Building2 className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">Department:</span>
						<span className="font-medium text-foreground">{provider.department}</span>
						{provider.level && (
							<>
								<span className="text-muted-foreground">•</span>
								<span className="text-muted-foreground">Level:</span>
								<span className="font-medium text-foreground">{provider.level}</span>
							</>
						)}
					</div>
				)}

				{/* Specialization */}
				{provider.providerCategory && (
					<div className="flex items-center gap-2 text-sm">
						<Star className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">Specialization:</span>
						<Badge variant="outline" className="text-xs">
							{provider.providerCategory}
						</Badge>
					</div>
				)}

				{/* Member Since */}
				<div className="flex items-center gap-2 text-sm">
					<Calendar className="h-4 w-4 text-muted-foreground" />
					<span className="text-muted-foreground">Member since:</span>
					<span className="font-medium text-foreground">
						{formatJoinDate(provider.createdAt)}
					</span>
				</div>

				{/* Contact Button */}
				{provider.email && (
					<div className="pt-2">
						<Button 
							variant="outline" 
							size="sm" 
							className="w-full"
							onClick={() => window.open(`mailto:${provider.email}`, '_blank')}
						>
							<Mail className="h-4 w-4 mr-2" />
							Contact Provider
						</Button>
					</div>
				)}

				{/* Matric Number (for students who became providers) */}
				{provider.matricNumber && (
					<div className="text-xs text-muted-foreground pt-2 border-t">
						<span>Matric: {provider.matricNumber}</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
