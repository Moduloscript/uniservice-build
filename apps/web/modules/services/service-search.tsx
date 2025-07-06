import { Search, X } from "lucide-react";
import { Input } from "@ui/components/input";
import { Button } from "@ui/components/button";

interface ServiceSearchProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function ServiceSearch({
	value,
	onChange,
	placeholder = "Search services...",
}: ServiceSearchProps) {
	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="pl-10 pr-10 h-11 text-sm bg-background border-border focus:border-primary transition-colors"
			/>
			{value && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => onChange("")}
					className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 hover:bg-muted rounded-md"
				>
					<X className="h-4 w-4 text-muted-foreground" />
					<span className="sr-only">Clear search</span>
				</Button>
			)}
		</div>
	);
}
