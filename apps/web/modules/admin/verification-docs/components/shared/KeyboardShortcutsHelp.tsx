"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import { KeyboardIcon } from "lucide-react";
import * as React from "react";

interface ShortcutProps {
	combo: string[];
	description: string;
}

function Shortcut({ combo, description }: ShortcutProps) {
	return (
		<li className="flex items-center justify-between py-2">
			<span
				className="text-sm text-muted-foreground"
				id={`desc-${combo.join("-")}`}
			>
				{description}
			</span>
			<fieldset
				className="flex items-center gap-1"
				aria-labelledby={`desc-${combo.join("-")}`}
			>
				{combo.map((key, index) => (
					<span key={`${key}-${index}`}>
						<kbd className="rounded px-2 py-1 text-xs font-semibold bg-muted">
							{key}
						</kbd>
						{index < combo.length - 1 && (
							<span className="text-xs text-muted-foreground mx-1">
								+
							</span>
						)}
					</span>
				))}
			</fieldset>
		</li>
	);
}

export function KeyboardShortcutsHelp(): JSX.Element {
	const [open, setOpen] = React.useState<boolean>(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					aria-label="View keyboard shortcuts"
				>
					<KeyboardIcon className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent
				className="sm:max-w-md"
				aria-labelledby="shortcuts-dialog-title"
				aria-describedby="shortcuts-dialog-description"
			>
				<DialogHeader>
					<DialogTitle id="shortcuts-dialog-title">
						Keyboard Shortcuts
					</DialogTitle>
					<DialogDescription id="shortcuts-dialog-description">
						These shortcuts help you navigate and manage
						verification documents efficiently.
					</DialogDescription>
				</DialogHeader>
				<nav aria-label="Keyboard shortcuts">
					<ul className="space-y-1 list-none">
						<Shortcut
							combo={["Ctrl/⌘", "Space"]}
							description="Select/deselect document"
						/>
						<Shortcut
							combo={["Enter"]}
							description="View document details"
						/>
						<Shortcut
							combo={["Ctrl/⌘", "A"]}
							description="Select all documents"
						/>
						<Shortcut
							combo={["Ctrl/⌘", "D"]}
							description="Clear selection"
						/>
						<Shortcut
							combo={["↑", "↓"]}
							description="Navigate documents"
						/>
						<Shortcut
							combo={["Ctrl/⌘", "Y"]}
							description="Approve selected"
						/>
						<Shortcut
							combo={["Ctrl/⌘", "N"]}
							description="Reject selected"
						/>
						<Shortcut
							combo={["Esc"]}
							description="Clear selection/Close dialog"
						/>
					</ul>
				</nav>
			</DialogContent>
		</Dialog>
	);
}
