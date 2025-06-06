import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { cn } from "@ui/lib";
import * as React from "react";

interface StudentDetailsStepProps {
	form: any;
	isLoading: boolean;
}

export function StudentDetailsStep({
	form,
	isLoading,
}: StudentDetailsStepProps) {
	return (
		<>
			<FormField
				control={form.control}
				name="matricNumber"
				render={({ field }) => (
					<FormItem className="space-y-1">
						<FormLabel>Matric Number</FormLabel>
						<FormControl>
							<Input
								{...field}
								disabled={isLoading}
								placeholder="Format: UYYYY/XXXXXXX"
								className={cn(
									"transition-colors uppercase",
									form.formState.errors.matricNumber &&
										"border-destructive",
								)}
								onChange={(e) => {
									const value = e.target.value.toUpperCase();
									field.onChange(value);
								}}
							/>
						</FormControl>
						<FormMessage className="text-xs" />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="department"
				render={({ field }) => (
					<FormItem className="space-y-1">
						<FormLabel>Department</FormLabel>
						<FormControl>
							<Input
								{...field}
								disabled={isLoading}
								placeholder="Your department name"
								className={cn(
									"transition-colors",
									form.formState.errors.department &&
										"border-destructive",
								)}
							/>
						</FormControl>
						<FormMessage className="text-xs" />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="level"
				render={({ field }) => (
					<FormItem className="space-y-1">
						<FormLabel>Level</FormLabel>
						<FormControl>
							<Select
								value={field.value?.toString()}
								onValueChange={(value) =>
									field.onChange(Number.parseInt(value))
								}
								disabled={isLoading}
							>
								<SelectTrigger
									className={cn(
										"w-full",
										form.formState.errors.level &&
											"border-destructive",
									)}
								>
									<SelectValue placeholder="Select your level" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="100">
										100 Level
									</SelectItem>
									<SelectItem value="200">
										200 Level
									</SelectItem>
									<SelectItem value="300">
										300 Level
									</SelectItem>
									<SelectItem value="400">
										400 Level
									</SelectItem>
									<SelectItem value="500">
										500 Level
									</SelectItem>
									<SelectItem value="600">
										600 Level
									</SelectItem>
									<SelectItem value="700">
										700 Level
									</SelectItem>
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage className="text-xs" />
					</FormItem>
				)}
			/>
		</>
	);
}
