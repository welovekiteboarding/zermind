"use client";

import { type Attachment } from "@/lib/schemas/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Download,
  Eye,
  Paperclip,
} from "lucide-react";
import { formatBytes } from "@/components/dropzone";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface MessageAttachmentProps {
  attachments: Attachment[];
  className?: string;
  showCompact?: boolean; // New prop for compact view in message list
}

export function MessageAttachment({
  attachments,
  className,
  showCompact = false,
}: MessageAttachmentProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [refreshedUrls, setRefreshedUrls] = useState<Record<string, string>>(
    {}
  );
  // Store pending promises to prevent duplicate requests
  const pendingRefreshes = useRef<Record<string, Promise<string>>>({});

  // Create Supabase client once and reuse it
  const supabaseRef = useRef(createClient());

  if (!attachments || attachments.length === 0) {
    return null;
  }

  // Function to refresh signed URL when it expires
  const refreshSignedUrl = async (attachment: Attachment): Promise<string> => {
    if (!attachment.filePath) {
      console.warn("No filePath available for attachment:", attachment.name);
      return attachment.url;
    }

    // Check if there's already a pending request for this filePath
    if (attachment.filePath in pendingRefreshes.current) {
      console.log("Reusing pending refresh request for:", attachment.filePath);
      return pendingRefreshes.current[attachment.filePath];
    }

    // Create a new promise for this refresh request
    const refreshPromise = (async () => {
      try {
        const { data, error } = await supabaseRef.current.storage
          .from("chat-attachments")
          .createSignedUrl(attachment.filePath!, 3600); // 1 hour expiry

        if (error) {
          console.error("Error refreshing signed URL:", error);
          return attachment.url;
        }

        setRefreshedUrls((prev) => ({
          ...prev,
          [attachment.id]: data.signedUrl,
        }));
        return data.signedUrl;
      } catch (error) {
        console.error("Failed to refresh signed URL:", error);
        return attachment.url;
      } finally {
        // Clean up the pending promise when done
        delete pendingRefreshes.current[attachment.filePath!];
      }
    })();

    // Store the promise to prevent duplicate requests
    pendingRefreshes.current[attachment.filePath!] = refreshPromise;

    return refreshPromise;
  };

  const handleImageError = async (attachmentId: string) => {
    setImageErrors((prev) => new Set(prev).add(attachmentId));

    // Try to refresh the signed URL if it failed
    const attachment = attachments.find((att) => att.id === attachmentId);
    if (attachment && attachment.filePath) {
      await refreshSignedUrl(attachment);
    }
  };

  const getAttachmentUrl = (attachment: Attachment): string => {
    return refreshedUrls[attachment.id] || attachment.url;
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
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

  // Compact view - just show attachment indicator
  if (showCompact) {
    return (
      <div className={cn("flex items-center space-x-1 mt-1", className)}>
        <Paperclip className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {attachments.length} attachment{attachments.length > 1 ? "s" : ""}
        </span>
        <div className="flex space-x-1">
          {attachments.slice(0, 3).map((attachment) => (
            <div
              key={attachment.id}
              className="h-2 w-2 rounded-full bg-current opacity-60"
            />
          ))}
          {attachments.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{attachments.length - 3}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 mt-2", className)}>
      {/* Grid layout for multiple images */}
      {attachments.filter(
        (att) => att.type === "image" && !imageErrors.has(att.id)
      ).length > 1 ? (
        <div className="grid grid-cols-2 gap-2">
          {attachments
            .filter((att) => att.type === "image" && !imageErrors.has(att.id))
            .slice(0, 4)
            .map((attachment) => (
              <Card
                key={attachment.id}
                className="overflow-hidden cursor-pointer"
                onClick={() => setExpandedImage(attachment.id)}
              >
                <div className="relative aspect-square">
                  <NextImage
                    src={getAttachmentUrl(attachment)}
                    alt={attachment.name}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(attachment.id)}
                  />
                  {attachments.filter((att) => att.type === "image").length >
                    4 &&
                    attachments
                      .filter((att) => att.type === "image")
                      .indexOf(attachment) === 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium">
                          +
                          {attachments.filter((att) => att.type === "image")
                            .length - 4}
                        </span>
                      </div>
                    )}
                </div>
              </Card>
            ))}
        </div>
      ) : (
        attachments.map((attachment) => {
          const isImage =
            attachment.type === "image" && !imageErrors.has(attachment.id);

          return (
            <Card
              key={attachment.id}
              className="overflow-hidden bg-background/50 hover:bg-background/70 transition-colors"
            >
              {isImage ? (
                <div className="relative">
                  <div className="relative max-w-sm">
                    <NextImage
                      src={getAttachmentUrl(attachment)}
                      alt={attachment.name}
                      width={400}
                      height={300}
                      className="object-cover max-w-full h-auto rounded-t-lg cursor-pointer"
                      onError={() => handleImageError(attachment.id)}
                      onClick={() => setExpandedImage(attachment.id)}
                    />
                    {/* Image overlay controls */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedImage(attachment.id);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getAttachmentUrl(attachment), "_blank");
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-2 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
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
                        onClick={() =>
                          window.open(getAttachmentUrl(attachment), "_blank")
                        }
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs font-medium truncate mt-1">
                      {attachment.name}
                    </p>
                  </CardContent>
                </div>
              ) : (
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 p-2 bg-muted rounded-lg">
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
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(getAttachmentUrl(attachment), "_blank")
                        }
                        className="h-8 w-8 p-0"
                        title="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = getAttachmentUrl(attachment);
                          link.download = attachment.name;
                          link.click();
                        }}
                        className="h-8 w-8 p-0"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })
      )}

      {/* Expanded image modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => setExpandedImage(null)}
            >
              ✕
            </Button>
            {(() => {
              const attachment = attachments.find(
                (att) => att.id === expandedImage
              );
              return attachment ? (
                <NextImage
                  src={getAttachmentUrl(attachment)}
                  alt={attachment.name}
                  width={800}
                  height={600}
                  className="object-contain max-w-full max-h-full"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
