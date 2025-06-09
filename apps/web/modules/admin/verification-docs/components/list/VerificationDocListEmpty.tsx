import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { FileIcon } from "lucide-react";

export function VerificationDocListEmpty() {
	return (
		<Alert className="flex items-center gap-4">
			<FileIcon className="h-5 w-5 text-muted-foreground" />
			<div>
				<AlertTitle>No Documents Found</AlertTitle>
				<AlertDescription className="text-muted-foreground">
					There are no verification documents to review at this time.
				</AlertDescription>
			</div>
		</Alert>
	);
}
