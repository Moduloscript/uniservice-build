"use client";

import { useState } from "react";
import { cn } from "@ui/lib";
import Image from "next/image";
import { DocumentTypeIcon } from "./DocumentTypeIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog";
import { Skeleton } from "@ui/components/skeleton";
import { Button } from "@ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/components/tooltip";
import { Eye, Download, ExternalLink } from "lucide-react";

interface DocumentPreviewProps {
  url: string;
  filename: string;
  className?: string;
  previewSize?: number;
  thumbnailSize?: number;
}

export function DocumentPreview({
  url,
  filename,
  className,
  previewSize = 800,
  thumbnailSize = 64,
}: DocumentPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const extension = filename.split(".").pop()?.toLowerCase() || "";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
  const isPDF = extension === "pdf";

  const handleOpenPreview = () => {
    if (isImage || isPDF) {
      setIsPreviewOpen(true);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setError("Failed to load image");
    setIsLoading(false);
  };

  const PreviewContent = (
    <div
      className={cn(
        "relative group",
        isImage && "cursor-pointer",
        className
      )}
    >
      {isImage ? (
        <>
          {isLoading && <Skeleton className="w-16 h-16 rounded-md" />}
          <Image
            src={url}
            alt={filename}
            width={thumbnailSize}
            height={thumbnailSize}
            className={cn(
              "rounded-md object-cover transition-all",
              "group-hover:opacity-90",
              isLoading && "invisible h-0"
            )}
            onClick={handleOpenPreview}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {!isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/5 rounded-md">
              <span className="text-xs font-medium text-muted-foreground">
                Preview
              </span>
            </div>
          )}
        </>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-2",
            "w-16 h-16 rounded-md border bg-muted/30",
            className
          )}
        >
          <DocumentTypeIcon filename={filename} size={24} />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleOpenPreview}
                    disabled={!isPDF}
                  >
                    <Eye className="h-3 w-3" />
                    <span className="sr-only">Preview</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview document</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={url}
                    download={filename}
                    className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <Download className="h-3 w-3" />
                    <span className="sr-only">Download</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download document</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">Open in new tab</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open in new tab</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {PreviewContent}

      {(isImage || isPDF) && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{filename}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={url}
                    download={filename}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="relative overflow-hidden rounded-lg">
              {isImage ? (
                <Image
                  src={url}
                  alt={filename}
                  width={previewSize}
                  height={Math.round(previewSize * 0.75)}
                  className="object-contain w-full"
                  priority
                />
              ) : isPDF ? (
                <iframe
                  src={url}
                  className="w-full h-[80vh] min-h-[600px]"
                  title={filename}
                />
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
