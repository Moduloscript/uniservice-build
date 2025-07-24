import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import type { SortOption } from "./services-marketplace";

interface ServiceSortProps {
	value: SortOption;
	onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
	{ value: "name-asc", label: "Name (A-Z)" },
	{ value: "name-desc", label: "Name (Z-A)" },
	{ value: "price-asc", label: "Price (Low to High)" },
	{ value: "price-desc", label: "Price (High to Low)" },
	{ value: "duration-asc", label: "Duration (Short to Long)" },
	{ value: "duration-desc", label: "Duration (Long to Short)" },
];

export function ServiceSort({ value, onChange }: ServiceSortProps) {
	return (
		<div className="space-y-2">
			<label className="text-sm font-medium text-foreground">
				Sort by
			</label>
			<Select
				value={value}
				onValueChange={(val) => onChange(val as SortOption)}
			>
				<SelectTrigger className="w-full h-11">
					<SelectValue placeholder="Choose sorting..." />
				</SelectTrigger>
				<SelectContent>
					{sortOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
