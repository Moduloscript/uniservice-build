"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@ui/lib";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<CollapsiblePrimitive.Trigger
		ref={ref}
		className={cn("flex items-center justify-between space-x-4", className)}
		{...props}
	/>
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

const CollapsibleContent = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
	<CollapsiblePrimitive.Content
		ref={ref}
		className={cn(
			"overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
			className,
		)}
		{...props}
	/>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
