"use client";

import { Button } from "../../../../../../modules/ui/components/button";
import { Mail } from "lucide-react";

interface ContactProviderButtonProps {
	email: string;
}

export function ContactProviderButton({ email }: ContactProviderButtonProps) {
	return (
		<Button 
			variant="outline" 
			size="lg" 
			className="text-lg px-8"
			onClick={() => window.open(`mailto:${email}`, '_blank')}
		>
			<Mail className="h-5 w-5 mr-2" />
			Contact Provider
		</Button>
	);
}
