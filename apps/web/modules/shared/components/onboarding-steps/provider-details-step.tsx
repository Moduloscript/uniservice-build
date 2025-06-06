import { CATEGORY_VERIFICATION_REQUIREMENTS } from "@repo/api/src/lib/category-verification-requirements";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
// (Removed unused ReactNode import)

interface ProviderDetailsStepProps {
	form: any;
	isLoading: boolean;
	setProviderCategory: (cat: string) => void;
}

export function ProviderDetailsStep({
	form,
	isLoading,
	setProviderCategory,
}: ProviderDetailsStepProps) {
	return (
		<FormField
			control={form.control}
			name="providerCategory"
			render={({ field }) => (
				<FormItem className="space-y-1">
					<FormLabel>Service Category</FormLabel>
					<FormControl>
						<Select
							value={field.value ?? ""}
							onValueChange={(value) => {
								field.onChange(value);
								setProviderCategory(value);
							}}
							disabled={isLoading}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(
									CATEGORY_VERIFICATION_REQUIREMENTS,
								).map(([id, category]) => (
									<SelectItem key={id} value={id}>
										{category.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
