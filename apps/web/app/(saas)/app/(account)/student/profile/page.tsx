"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { Badge } from "@ui/components/badge";
import { Separator } from "@ui/components/separator";
import {
	User,
	Settings,
	Bell,
	ArrowLeft,
	Shield,
	Calendar,
	GraduationCap,
	CheckCircle,
	AlertCircle,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
	studentProfileApi,
	studentProfileQueryKeys,
	ProfileUpdateData,
	NotificationPreferences,
} from "@/modules/student/api";
import {
	ProfileForm,
	NotificationSettings,
} from "@/modules/student/components";

export default function StudentProfilePage() {
	const [activeTab, setActiveTab] = useState("profile");
	const queryClient = useQueryClient();

	// Fetch profile data
	const {
		data: profileData,
		isLoading: isProfileLoading,
		error: profileError,
	} = useQuery({
		queryKey: studentProfileQueryKeys.detail(),
		queryFn: () => studentProfileApi.getProfile(),
	});

	// Fetch notification settings
	const {
		data: notificationData,
		isLoading: isNotificationLoading,
		error: notificationError,
	} = useQuery({
		queryKey: studentProfileQueryKeys.notificationSettings(),
		queryFn: () => studentProfileApi.getNotificationSettings(),
	});

	// Profile update mutation
	const profileMutation = useMutation({
		mutationFn: (data: ProfileUpdateData) => studentProfileApi.updateProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: studentProfileQueryKeys.detail() });
			toast.success("Profile updated successfully!");
		},
		onError: (error) => {
			toast.error("Failed to update profile. Please try again.");
			console.error("Profile update error:", error);
		},
	});

	// Notification settings update mutation
	const notificationMutation = useMutation({
		mutationFn: (settings: NotificationPreferences) =>
			studentProfileApi.updateNotificationSettings(settings),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: studentProfileQueryKeys.notificationSettings(),
			});
			toast.success("Notification settings updated successfully!");
		},
		onError: (error) => {
			toast.error("Failed to update notification settings. Please try again.");
			console.error("Notification settings update error:", error);
		},
	});

	const handleProfileSubmit = async (data: ProfileUpdateData) => {
		await profileMutation.mutateAsync(data);
	};

	const handleNotificationSubmit = async (settings: NotificationPreferences) => {
		await notificationMutation.mutateAsync(settings);
	};

	if (isProfileLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4">
					<div className="relative">
						<Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
						<div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
					</div>
					<div className="space-y-2">
						<p className="text-lg font-medium">Loading your profile...</p>
						<p className="text-sm text-muted-foreground">
							Please wait while we fetch your data
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (profileError) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4 max-w-md">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
						<AlertCircle className="w-8 h-8 text-red-500" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-semibold text-red-600">
							Error Loading Profile
						</h2>
						<p className="text-sm text-muted-foreground">
							We're having trouble loading your profile data. Please try
							refreshing the page or contact support if the problem persists.
						</p>
					</div>
					<Button
						onClick={() => window.location.reload()}
						variant="outline"
					>
						Refresh Page
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Enhanced Header Section */}
			<div className="bg-card border-b shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between py-6">
						<div className="flex items-center space-x-4">
							<Button asChild variant="ghost" size="sm">
								<Link href="/app/student">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Dashboard
								</Link>
							</Button>
							<Separator orientation="vertical" className="h-6" />
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
									<User className="h-5 w-5 text-primary-foreground" />
								</div>
								<div>
									<h1 className="text-3xl font-bold tracking-tight text-foreground">
										Profile Settings
									</h1>
									<p className="text-sm text-muted-foreground mt-1">
										Manage your account information and preferences
									</p>
								</div>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							{profileData?.verified && (
								<Badge variant="secondary" className="text-xs">
									<CheckCircle className="h-3 w-3 mr-1" />
									Verified Student
								</Badge>
							)}
							<Badge variant="outline" className="text-xs">
								<Shield className="h-3 w-3 mr-1" />
								Secure
							</Badge>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-8">
					{/* Profile Overview Card */}
					<Card className="border-0 bg-gradient-to-r from-primary/5 to-secondary/5">
						<CardContent className="p-6">
							<div className="flex items-center space-x-6">
								<div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
									<User className="h-10 w-10 text-primary-foreground" />
								</div>
								<div className="flex-1 space-y-2">
									<div className="flex items-center space-x-3">
										<h2 className="text-2xl font-bold">
											{profileData?.name || "Student"}
										</h2>
										{profileData?.level && (
											<Badge variant="secondary">
												<GraduationCap className="h-3 w-3 mr-1" />
												{profileData.level} Level
											</Badge>
										)}
									</div>
									<p className="text-muted-foreground">
										{profileData?.email}
									</p>
									{profileData?.department && (
										<p className="text-sm text-muted-foreground">
											{profileData.department}
										</p>
									)}
									{profileData?.matricNumber && (
										<p className="text-xs text-muted-foreground">
											Matric: {profileData.matricNumber}
										</p>
									)}
								</div>
								<div className="text-right space-y-1">
									<div className="text-sm text-muted-foreground">
										Member since
									</div>
									<div className="text-sm font-medium">
										{profileData?.createdAt
											? new Date(profileData.createdAt).toLocaleDateString(
													"en-US",
													{
														year: "numeric",
														month: "long",
													}
											  )
											: "N/A"}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Tabbed Interface */}
					<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
						<div className="border-b">
							<TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
								<TabsTrigger value="profile" className="flex items-center gap-2">
									<User className="h-4 w-4" />
									Profile Information
								</TabsTrigger>
								<TabsTrigger value="notifications" className="flex items-center gap-2">
									<Bell className="h-4 w-4" />
									Notifications
								</TabsTrigger>
							</TabsList>
						</div>

						{/* Profile Information Tab */}
						<TabsContent value="profile" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Settings className="h-5 w-5" />
										Account Information
									</CardTitle>
									<CardDescription>
										Update your personal details, academic information, and profile settings
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ProfileForm
										initialData={{
											name: profileData?.name || "",
											email: profileData?.email || "",
											username: profileData?.username || "",
											matricNumber: profileData?.matricNumber || "",
											department: profileData?.department || "",
											level: profileData?.level,
											phone: profileData?.phone || "",
											bio: profileData?.bio || "",
											location: profileData?.location || "",
											dateOfBirth: profileData?.dateOfBirth || "",
											image: profileData?.image || "",
										}}
										onSubmit={handleProfileSubmit}
										isLoading={profileMutation.isPending}
									/>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Notification Settings Tab */}
						<TabsContent value="notifications" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Bell className="h-5 w-5" />
										Notification Preferences
									</CardTitle>
									<CardDescription>
										Customize how and when you receive notifications about bookings, payments, and platform updates
									</CardDescription>
								</CardHeader>
								<CardContent>
									{isNotificationLoading ? (
										<div className="flex items-center justify-center py-12">
											<div className="text-center space-y-3">
												<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
												<p className="text-sm text-muted-foreground">
													Loading notification settings...
												</p>
											</div>
										</div>
									) : notificationError ? (
										<div className="text-center py-12 space-y-3">
											<AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
											<p className="text-sm text-red-600">
												Failed to load notification settings
											</p>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													queryClient.invalidateQueries({
														queryKey: studentProfileQueryKeys.notificationSettings(),
													})
												}
											>
												Retry
											</Button>
										</div>
									) : (
										<NotificationSettings
											initialSettings={notificationData}
											onSave={handleNotificationSubmit}
											isLoading={notificationMutation.isPending}
										/>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
