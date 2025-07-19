"use client";

import { FormControl, FormLabel, FormMessage } from "@ui/components/form";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Progress } from "@ui/components/progress";
import { cn } from "@ui/lib";
import { AlertCircle, CheckCircle2, RefreshCw, Upload, X } from "lucide-react";
import * as React from "react";
import { useCallback } from "react";
import { Spinner } from "../Spinner";

export interface EnhancedFileUploadFieldProps {
  label: string;
  description?: string;
  value: string;
  onFileChange: (file: File | null) => void;
  isLoading?: boolean;
  progress?: number;
  error?: string | null;
  onRetry?: () => void;
  accept?: string;
  helpText?: string;
  disabled?: boolean;
  maxSize?: number; // in MB
  showPreview?: boolean;
}

export function EnhancedFileUploadField({
  label,
  description,
  value,
  onFileChange,
  isLoading = false,
  progress = 0,
  error,
  onRetry,
  accept = "image/jpeg,image/png,application/pdf",
  helpText,
  disabled = false,
  maxSize = 5,
  showPreview = true,
}: EnhancedFileUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) {
        onFileChange(null);
        return;
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        return; // Size validation handled by parent
      }

      onFileChange(file);
    },
    [onFileChange, maxSize]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) {
      setDragOver(true);
    }
  }, [disabled, isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      if (disabled || isLoading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, isLoading, handleFileSelect]
  );

  // Clear file
  const handleClear = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileChange(null);
  }, [onFileChange]);

  // Click to select file
  const handleClick = useCallback(() => {
    if (!disabled && !isLoading && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled, isLoading]);

  // Get file name from path
  const getFileName = useCallback((filePath: string) => {
    return filePath.split('/').pop() || filePath;
  }, []);

  // Determine upload status
  const isComplete = value && !isLoading && !error;
  const hasProgress = isLoading && progress > 0;

  return (
    <div className="space-y-3">
      <FormLabel className="text-sm font-medium">{label}</FormLabel>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <FormControl>
        <div className="space-y-3">
          {/* Hidden file input */}
          <Input
            ref={inputRef}
            type="file"
            accept={accept}
            disabled={disabled || isLoading}
            onChange={handleInputChange}
            className="sr-only"
            aria-describedby={helpText ? `${label}-help` : undefined}
          />

          {/* Drop zone */}
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
              dragOver && "border-primary bg-primary/5",
              !dragOver && !error && "border-muted-foreground/25 hover:border-muted-foreground/50",
              error && "border-destructive/50 bg-destructive/5",
              isComplete && "border-success bg-success/5",
              (disabled || isLoading) && "cursor-not-allowed opacity-60"
            )}
            role="button"
            tabIndex={disabled || isLoading ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }}
          >
            <div className="flex flex-col items-center gap-2">
              {/* Upload icon */}
              {isLoading ? (
                <Spinner className="size-8" />
              ) : isComplete ? (
                <CheckCircle2 className="size-8 text-green-600" />
              ) : error ? (
                <AlertCircle className="size-8 text-destructive" />
              ) : (
                <Upload className="size-8 text-muted-foreground" />
              )}

              {/* Upload text */}
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isLoading 
                    ? "Uploading..." 
                    : isComplete 
                    ? "Upload complete" 
                    : "Drop files here or click to browse"
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {accept.replace(/,/g, ", ")} • Max {maxSize}MB
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {hasProgress && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(progress)}% uploaded
              </p>
            </div>
          )}

          {/* File preview */}
          {showPreview && value && (
            <div className="flex items-center justify-between rounded-md border border-muted-foreground/20 bg-muted/20 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                <span className="text-sm truncate">
                  {getFileName(value)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                disabled={disabled || isLoading}
                className="h-auto p-1 shrink-0"
              >
                <X className="size-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          )}

          {/* Error message with retry */}
          {error && (
            <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-destructive shrink-0" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
              {onRetry && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  disabled={disabled}
                  className="h-auto px-2 py-1 shrink-0"
                >
                  <RefreshCw className="size-3 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          )}

          {/* Help text */}
          {helpText && (
            <p
              id={`${label}-help`}
              className="text-xs text-muted-foreground"
            >
              {helpText}
            </p>
          )}
        </div>
      </FormControl>

      <FormMessage className="text-xs" />
    </div>
  );
}
