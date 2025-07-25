"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@ui/components/card";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar";
import { Badge } from "@ui/components/badge";
import {
	User,
	Mail,
	Phone,
	GraduationCap,
	BookOpen,
	MapPin,
	Calendar,
	Camera,
	Save,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	studentProfileApi,
	studentProfileQueryKeys,
} from "@/modules/student/api";

// Profile form schema
const profileFormSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	username: z.string().optional(),
	matricNumber: z.string().optional(),
	department: z.string().optional(),
	level: z.coerce.number().min(100).max(800).optional(),
	phone: z.string().optional(),
	bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
	location: z.string().optional(),
	dateOfBirth: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
	initialData?: Partial<ProfileFormData>;
	onSubmit: (data: ProfileFormData) => Promise<void>;
	isLoading?: boolean;
}

// University departments for University of Benin
const DEPARTMENTS = [
	"Computer Science",
	"Mathematics", 
	"Physics",
	"Chemistry",
	"Biology",
	"Geology",
	"Statistics",
	"Biochemistry",
	"Microbiology",
	"Industrial Mathematics",
	"Medicine",
	"Pharmacy",
	"Nursing",
	"Medical Laboratory Science",
	"Physiotherapy",
	"Engineering (Civil)",
	"Engineering (Electrical/Electronics)",
	"Engineering (Mechanical)",
	"Engineering (Chemical)",
	"Engineering (Petroleum)",
	"Architecture",
	"Building Technology",
	"Urban and Regional Planning",
	"Quantity Surveying",
	"Estate Management",
	"Economics",
	"Accounting",
	"Banking and Finance",
	"Business Administration",
	"Marketing",
	"Insurance",
	"Political Science",
	"Public Administration",
	"International Studies",
	"History and International Studies",
	"Philosophy",
	"Religious Studies",
	"English and Literature",
	"Linguistics",
	"Theatre Arts",
	"Music",
	"Fine and Applied Arts",
	"Mass Communication",
	"Library and Information Science",
	"Psychology",
	"Sociology and Anthropology",
	"Social Work",
	"Geography and Regional Planning",
	"Law",
	"Education",
	"Agricultural Economics and Extension",
	"Animal Science",
	"Crop Science",
	"Forestry and Wildlife",
	"Soil Science",
	"Agricultural Engineering",
	"Fisheries",
	"Home Economics",
	"Veterinary Medicine",
	"Food Science and Technology",
];

// Academic levels
const LEVELS = [
	{ value: 100, label: "100 Level" },
	{ value: 200, label: "200 Level" },
	{ value: 300, label: "300 Level" },
	{ value: 400, label: "400 Level" },
	{ value: 500, label: "500 Level" },
	{ value: 600, label: "600 Level (Postgraduate)" },
	{ value: 700, label: "700 Level (Masters)" },
	{ value: 800, label: "800 Level (PhD)" },
];

export function ProfileForm({ initialData, onSubmit, isLoading }: ProfileFormProps) {
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const queryClient = useQueryClient();

	// Image upload mutation
	const imageUploadMutation = useMutation({
		mutationFn: (file: File) => studentProfileApi.uploadProfileImage(file),
		onSuccess: (updatedUser) => {
			// Update React Query cache
			queryClient.setQueryData(
				studentProfileQueryKeys.detail(), 
				updatedUser
			);
			// Clear the preview and file state
			setImageFile(null);
			setImagePreview(null);
			toast.success("Profile image updated successfully!");
		},
		onError: (error) => {
			toast.error("Failed to upload image. Please try again.");
			console.error("Image upload error:", error);
		},
	});

	const form = useForm<ProfileFormData>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			name: initialData?.name || "",
			email: initialData?.email || "",
			username: initialData?.username || "",
			matricNumber: initialData?.matricNumber || "",
			department: initialData?.department || "",
			level: initialData?.level || undefined,
			phone: initialData?.phone || "",
			bio: initialData?.bio || "",
			location: initialData?.location || "",
			dateOfBirth: initialData?.dateOfBirth || "",
		},
	});

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Image size must be less than 5MB");
				return;
			}

			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast.error("Please select a valid image file");
				return;
			}

			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (data: ProfileFormData) => {
		try {
			await onSubmit(data);
			toast.success("Profile updated successfully!");
		} catch (error) {
			toast.error("Failed to update profile. Please try again.");
		}
	};

	return (
		<div className="space-y-6">
			{/* Profile Picture Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Camera className="h-5 w-5" />
						Profile Picture
					</CardTitle>
					<CardDescription>
						Upload a profile picture to help providers recognize you
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-6">
						<div className="relative">
							<Avatar className="h-24 w-24">
								<AvatarImage
									src={imagePreview || initialData?.image || ""}
									alt="Profile picture"
								/>
								<AvatarFallback className="text-lg">
									{initialData?.name?.charAt(0)?.toUpperCase() || "U"}
								</AvatarFallback>
							</Avatar>
							<div className="absolute -bottom-2 -right-2">
								<label
									htmlFor="profile-image"
									className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
								>
									<Camera className="h-4 w-4" />
								</label>
								<input
									id="profile-image"
									type="file"
									accept="image/*"
									onChange={handleImageChange}
									className="hidden"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium">Change Profile Picture</p>
							<p className="text-xs text-muted-foreground">
								JPG, PNG or GIF. Max size of 5MB.
							</p>
							{imageFile && (
								<div className="space-y-2">
									<Badge variant="secondary" className="text-xs">
										{imageFile.name}
									</Badge>
									<Button
										type="button"
										size="sm"
										onClick={() => imageUploadMutation.mutate(imageFile)}
										disabled={imageUploadMutation.isPending}
										className="w-full"
									>
										{imageUploadMutation.isPending ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Uploading...
											</>
										) : (
											<>
												<Camera className="h-4 w-4 mr-2" />
												Upload Image
											</>
										)}
									</Button>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					{/* Personal Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								Personal Information
							</CardTitle>
							<CardDescription>
								Update your personal details and contact information
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<User className="h-4 w-4" />
													Full Name
												</FormLabel>
												<FormControl>
													<Input placeholder="Enter your full name" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<Mail className="h-4 w-4" />
													Email Address
												</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="Enter your email"
														{...field}
														disabled
													/>
												</FormControl>
												<FormDescription>
													Email cannot be changed for security reasons
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="username"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Username</FormLabel>
												<FormControl>
													<Input placeholder="Choose a username" {...field} />
												</FormControl>
												<FormDescription>
													Optional. Used for profile URL: /student/@username
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<Phone className="h-4 w-4" />
													Phone Number
												</FormLabel>
												<FormControl>
													<Input
														type="tel"
														placeholder="+234 xxx xxx xxxx"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="location"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<MapPin className="h-4 w-4" />
													Location
												</FormLabel>
												<FormControl>
													<Input placeholder="City, State" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="dateOfBirth"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<Calendar className="h-4 w-4" />
													Date of Birth
												</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="bio"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Bio</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Tell us a bit about yourself, your interests, and learning goals..."
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormDescription>
												{form.watch("bio")?.length || 0}/500 characters
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Academic Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<GraduationCap className="h-5 w-5" />
								Academic Information
							</CardTitle>
							<CardDescription>
								Your academic details help providers understand your background
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="matricNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<BookOpen className="h-4 w-4" />
													Matric Number
												</FormLabel>
												<FormControl>
													<Input
														placeholder="e.g., UNI/BEN/2021/12345"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Your university matriculation number
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="level"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Academic Level</FormLabel>
												<Select
													onValueChange={(value) => field.onChange(Number(value))}
													value={field.value?.toString()}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select your level" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{LEVELS.map((level) => (
															<SelectItem
																key={level.value}
																value={level.value.toString()}
															>
																{level.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="department"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Department</FormLabel>
											<Select onValueChange={field.onChange} value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select your department" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="max-h-[200px]">
													{DEPARTMENTS.map((dept) => (
														<SelectItem key={dept} value={dept}>
															{dept}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Form Actions */}
					<div className="flex justify-end space-x-4">
						<Button type="button" variant="outline" onClick={() => form.reset()}>
							Reset Changes
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							className="min-w-[120px]"
						>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									Save Changes
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
