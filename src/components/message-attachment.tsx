"use client";

import { type Attachment } from "@/lib/schemas/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, FileText, ExternalLink } from "lucide-react";
import { formatBytes } from "@/components/dropzone";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { useState } from "react";

interface MessageAttachmentProps {
  attachments: Attachment[];
  className?: string;
}

export function MessageAttachment({ attachments, className }: MessageAttachmentProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleImageError = (attachmentId: string) => {
    setImageErrors(prev => new Set(prev).add(attachmentId));
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return "Image";
    }
    if (mimeType === "application/pdf") {
      return "PDF";
    }
    return "Document";
  };

  return (
    <div className={cn("space-y-2 mt-2", className)}>
      {attachments.map((attachment) => {
        const isImage = attachment.type === "image" && !imageErrors.has(attachment.id);
        
        return (
          <div key={attachment.id} className="border rounded-lg overflow-hidden bg-background/50">
            {isImage ? (
              <div className="relative">
                <NextImage
                  src={attachment.url}
                  alt={attachment.name}
                  width={300}
                  height={200}
                  className="object-cover max-w-full h-auto rounded-t-lg"
                  onError={() => handleImageError(attachment.id)}
                />
                <div className="p-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {getFileTypeLabel(attachment.mimeType)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(attachment.size)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs font-medium truncate mt-1">
                    {attachment.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getFileTypeIcon(attachment.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getFileTypeLabel(attachment.mimeType)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(attachment.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 