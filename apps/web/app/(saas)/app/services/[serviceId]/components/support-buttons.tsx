"use client";

import { Button } from "../../../../../../modules/ui/components/button";
import { Phone, MessageSquare, Mail, HelpCircle } from "lucide-react";

export function SupportButtons() {
	return (
		<div className="space-y-3">
			<Button 
				variant="outline" 
				size="sm" 
				className="w-full justify-start"
				onClick={() => window.open('tel:+1234567890', '_blank')}
			>
				<Phone className="h-4 w-4 mr-2" />
				Call Support
			</Button>
			<Button 
				variant="outline" 
				size="sm" 
				className="w-full justify-start"
			>
				<MessageSquare className="h-4 w-4 mr-2" />
				Live Chat
			</Button>
			<Button 
				variant="outline" 
				size="sm" 
				className="w-full justify-start"
				onClick={() => window.open('mailto:support@example.com', '_blank')}
			>
				<Mail className="h-4 w-4 mr-2" />
				Email Us
			</Button>
			<Button 
				variant="outline" 
				size="sm" 
				className="w-full justify-start"
			>
				<HelpCircle className="h-4 w-4 mr-2" />
				FAQ
			</Button>
		</div>
	);
}
