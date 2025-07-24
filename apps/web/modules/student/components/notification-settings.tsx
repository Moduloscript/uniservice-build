"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Switch } from "@ui/components/switch";
import { Label } from "@ui/components/label";
import { Separator } from "@ui/components/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import {
	Bell,
	Mail,
	MessageSquare,
	Smartphone,
	Calendar,
	DollarSign,
	Star,
	Users,
	AlertTriangle,
	Save,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferences {
	// Email notifications
	emailBookingConfirmations: boolean;
	emailBookingReminders: boolean;
	emailBookingUpdates: boolean;
	emailPaymentConfirmations: boolean;
	emailReviewRequests: boolean;
	emailPromotions: boolean;
	
	// SMS notifications  
	smsBookingReminders: boolean;
	smsBookingConfirmations: boolean;
	smsPaymentAlerts: boolean;
	smsEmergencyAlerts: boolean;
	
	// Push notifications
	pushBookingUpdates: boolean;
	pushNewMessages: boolean;
	pushProviderUpdates: boolean;
	pushPromotions: boolean;
	
	// Timing preferences
	reminderTiming: string; // "1h", "2h", "24h", "48h"
	digestFrequency: string; // "daily", "weekly", "monthly", "never"
	
	// Communication preferences
	communicationLanguage: string; // "en", "yo", "ig", "ha"
	timezone: string;
}

interface NotificationSettingsProps {
	initialSettings?: Partial<NotificationPreferences>;
	onSave: (settings: NotificationPreferences) => Promise<void>;
	isLoading?: boolean;
}

const REMINDER_TIMINGS = [
	{ value: "1h", label: "1 hour before" },
	{ value: "2h", label: "2 hours before" },
	{ value: "24h", label: "24 hours before" },
	{ value: "48h", label: "48 hours before" },
];

const DIGEST_FREQUENCIES = [
	{ value: "never", label: "Never" },
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" },
];

const LANGUAGES = [
	{ value: "en", label: "English" },
	{ value: "yo", label: "Yoruba" },
	{ value: "ig", label: "Igbo" },
	{ value: "ha", label: "Hausa" },
];

const TIMEZONES = [
	{ value: "Africa/Lagos", label: "West Africa Time (WAT)" },
	{ value: "UTC", label: "Coordinated Universal Time (UTC)" },
];

export function NotificationSettings({
	initialSettings,
	onSave,
	isLoading,
}: NotificationSettingsProps) {
	const [settings, setSettings] = useState<NotificationPreferences>({
		// Email defaults
		emailBookingConfirmations: initialSettings?.emailBookingConfirmations ?? true,
		emailBookingReminders: initialSettings?.emailBookingReminders ?? true,
		emailBookingUpdates: initialSettings?.emailBookingUpdates ?? true,
		emailPaymentConfirmations: initialSettings?.emailPaymentConfirmations ?? true,
		emailReviewRequests: initialSettings?.emailReviewRequests ?? true,
		emailPromotions: initialSettings?.emailPromotions ?? false,
		
		// SMS defaults
		smsBookingReminders: initialSettings?.smsBookingReminders ?? false,
		smsBookingConfirmations: initialSettings?.smsBookingConfirmations ?? false,
		smsPaymentAlerts: initialSettings?.smsPaymentAlerts ?? false,
		smsEmergencyAlerts: initialSettings?.smsEmergencyAlerts ?? true,
		
		// Push defaults
		pushBookingUpdates: initialSettings?.pushBookingUpdates ?? true,
		pushNewMessages: initialSettings?.pushNewMessages ?? true,
		pushProviderUpdates: initialSettings?.pushProviderUpdates ?? false,
		pushPromotions: initialSettings?.pushPromotions ?? false,
		
		// Timing defaults
		reminderTiming: initialSettings?.reminderTiming ?? "2h",
		digestFrequency: initialSettings?.digestFrequency ?? "weekly",
		
		// Communication defaults
		communicationLanguage: initialSettings?.communicationLanguage ?? "en",
		timezone: initialSettings?.timezone ?? "Africa/Lagos",
	});

	const handleSettingChange = (key: keyof NotificationPreferences, value: boolean | string) => {
		setSettings(prev => ({
			...prev,
			[key]: value,
		}));
	};

	const handleSave = async () => {
		try {
			await onSave(settings);
			toast.success("Notification settings updated successfully!");
		} catch (error) {
			toast.error("Failed to update notification settings. Please try again.");
		}
	};

	const NotificationToggle = ({
		id,
		label,
		description,
		icon: Icon,
		checked,
		onChange,
	}: {
		id: keyof NotificationPreferences;
		label: string;
		description: string;
		icon: any;
		checked: boolean;
		onChange: (checked: boolean) => void;
	}) => (
		<div className="flex items-center justify-between py-3">
			<div className="flex items-start space-x-3">
				<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
					<Icon className="h-4 w-4 text-primary" />
				</div>
				<div className="space-y-1">
					<Label htmlFor={id} className="text-sm font-medium cursor-pointer">
						{label}
					</Label>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
			</div>
			<Switch
				id={id}
				checked={checked}
				onCheckedChange={onChange}
			/>
		</div>
	);

	return (
		<div className="space-y-6">
			{/* Email Notifications */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Email Notifications
					</CardTitle>
					<CardDescription>
						Manage what email notifications you receive about your bookings and account
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<NotificationToggle
						id="emailBookingConfirmations"
						label="Booking Confirmations"
						description="Get notified when your bookings are confirmed or cancelled"
						icon={Calendar}
						checked={settings.emailBookingConfirmations}
						onChange={(checked) => handleSettingChange("emailBookingConfirmations", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="emailBookingReminders"
						label="Booking Reminders"
						description="Receive reminders before your scheduled sessions"
						icon={Bell}
						checked={settings.emailBookingReminders}
						onChange={(checked) => handleSettingChange("emailBookingReminders", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="emailBookingUpdates"
						label="Booking Updates"
						description="Stay informed about changes to your bookings"
						icon={AlertTriangle}
						checked={settings.emailBookingUpdates}
						onChange={(checked) => handleSettingChange("emailBookingUpdates", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="emailPaymentConfirmations"
						label="Payment Confirmations"
						description="Get receipts and payment confirmations via email"
						icon={DollarSign}
						checked={settings.emailPaymentConfirmations}
						onChange={(checked) => handleSettingChange("emailPaymentConfirmations", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="emailReviewRequests"
						label="Review Requests"
						description="Be prompted to leave reviews after completed services"
						icon={Star}
						checked={settings.emailReviewRequests}
						onChange={(checked) => handleSettingChange("emailReviewRequests", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="emailPromotions"
						label="Promotions & Marketing"
						description="Receive updates about new services, discounts, and platform news"
						icon={Bell}
						checked={settings.emailPromotions}
						onChange={(checked) => handleSettingChange("emailPromotions", checked)}
					/>
				</CardContent>
			</Card>

			{/* SMS Notifications */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						SMS Notifications
					</CardTitle>
					<CardDescription>
						Get important updates via text message (SMS charges may apply)
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<NotificationToggle
						id="smsBookingReminders"
						label="Booking Reminders"
						description="Text reminders before your scheduled sessions"
						icon={Calendar}
						checked={settings.smsBookingReminders}
						onChange={(checked) => handleSettingChange("smsBookingReminders", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="smsBookingConfirmations"
						label="Booking Confirmations"
						description="Instant SMS when bookings are confirmed or cancelled"
						icon={Bell}
						checked={settings.smsBookingConfirmations}
						onChange={(checked) => handleSettingChange("smsBookingConfirmations", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="smsPaymentAlerts"
						label="Payment Alerts"
						description="SMS notifications for payment confirmations and issues"
						icon={DollarSign}
						checked={settings.smsPaymentAlerts}
						onChange={(checked) => handleSettingChange("smsPaymentAlerts", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="smsEmergencyAlerts"
						label="Emergency Alerts"
						description="Critical platform alerts and security notifications"
						icon={AlertTriangle}
						checked={settings.smsEmergencyAlerts}
						onChange={(checked) => handleSettingChange("smsEmergencyAlerts", checked)}
					/>
				</CardContent>
			</Card>

			{/* Push Notifications */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Smartphone className="h-5 w-5" />
						Push Notifications
					</CardTitle>
					<CardDescription>
						Real-time notifications through your browser or mobile app
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<NotificationToggle
						id="pushBookingUpdates"
						label="Booking Updates"
						description="Real-time updates about your bookings and sessions"
						icon={Calendar}
						checked={settings.pushBookingUpdates}
						onChange={(checked) => handleSettingChange("pushBookingUpdates", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="pushNewMessages"
						label="New Messages"
						description="Notifications when providers send you messages"
						icon={MessageSquare}
						checked={settings.pushNewMessages}
						onChange={(checked) => handleSettingChange("pushNewMessages", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="pushProviderUpdates"
						label="Provider Updates"
						description="Updates from providers you've booked with before"
						icon={Users}
						checked={settings.pushProviderUpdates}
						onChange={(checked) => handleSettingChange("pushProviderUpdates", checked)}
					/>
					
					<Separator />
					
					<NotificationToggle
						id="pushPromotions"
						label="Promotions & Offers"
						description="Special offers and promotional notifications"
						icon={Star}
						checked={settings.pushPromotions}
						onChange={(checked) => handleSettingChange("pushPromotions", checked)}
					/>
				</CardContent>
			</Card>

			{/* Timing & Frequency Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Timing & Frequency
					</CardTitle>
					<CardDescription>
						Customize when and how often you receive notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="reminderTiming">Booking Reminder Timing</Label>
							<Select
								value={settings.reminderTiming}
								onValueChange={(value) => handleSettingChange("reminderTiming", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose reminder timing" />
								</SelectTrigger>
								<SelectContent>
									{REMINDER_TIMINGS.map((timing) => (
										<SelectItem key={timing.value} value={timing.value}>
											{timing.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="digestFrequency">Activity Digest Frequency</Label>
							<Select
								value={settings.digestFrequency}
								onValueChange={(value) => handleSettingChange("digestFrequency", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose digest frequency" />
								</SelectTrigger>
								<SelectContent>
									{DIGEST_FREQUENCIES.map((frequency) => (
										<SelectItem key={frequency.value} value={frequency.value}>
											{frequency.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Communication Preferences */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Communication Preferences
					</CardTitle>
					<CardDescription>
						Set your preferred language and timezone for notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="communicationLanguage">Preferred Language</Label>
							<Select
								value={settings.communicationLanguage}
								onValueChange={(value) => handleSettingChange("communicationLanguage", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose language" />
								</SelectTrigger>
								<SelectContent>
									{LANGUAGES.map((language) => (
										<SelectItem key={language.value} value={language.value}>
											{language.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="timezone">Timezone</Label>
							<Select
								value={settings.timezone}
								onValueChange={(value) => handleSettingChange("timezone", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose timezone" />
								</SelectTrigger>
								<SelectContent>
									{TIMEZONES.map((timezone) => (
										<SelectItem key={timezone.value} value={timezone.value}>
											{timezone.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Save Button */}
			<div className="flex justify-end">
				<Button
					onClick={handleSave}
					disabled={isLoading}
					className="min-w-[140px]"
				>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Saving...
						</>
					) : (
						<>
							<Save className="h-4 w-4 mr-2" />
							Save Settings
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
