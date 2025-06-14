"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  formatBytes,
} from "@/components/dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import {
  getAllowedMimeTypes,
  getMaxFileSize,
  getModelCapabilities,
  modelSupportsAttachments,
} from "@/lib/utils/model-utils";
import { type Attachment } from "@/lib/schemas/chat";
import { nanoid } from "nanoid";
import { Paperclip, X, Image as ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ChatAttachmentProps {
  model: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  disabled?: boolean;
  className?: string;
}

export function ChatAttachment({
  model,
  attachments = [],
  onAttachmentsChange,
  disabled = false,
  className,
}: ChatAttachmentProps) {
  const [showDropzone, setShowDropzone] = useState(false);

  const modelCapabilities = getModelCapabilities(model);
  const allowedMimeTypes = getAllowedMimeTypes(model);
  const supportsAttachments = modelSupportsAttachments(model);

  // Calculate max file size based on allowed types
  const maxFileSize = Math.max(
    ...allowedMimeTypes.map((mimeType) => getMaxFileSize(model, mimeType))
  );

  const upload = useSupabaseUpload({
    bucketName: "chat-attachments",
    path: `uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}`,
    allowedMimeTypes,
    maxFileSize,
    maxFiles: 5, // Allow up to 5 files per message
  });

  // Generate signed URL for private file access
  const generateSignedUrl = async (filePath: string): Promise<string> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("chat-attachments")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error("Error creating signed URL:", error);
        throw error;
      }

      if (!data || !data.signedUrl) {
        const errorMessage =
          "Failed to create signed URL: No data or signed URL returned";
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      return data.signedUrl;
    } catch (error) {
      console.error("Failed to generate signed URL:", error);
      throw error;
    }
  };

  const handleUploadSuccess = useCallback(async () => {
    try {
      const newAttachments: Attachment[] = await Promise.all(
        upload.files.map(async (file) => {
          const filePath = `uploads/${new Date().getFullYear()}/${
            new Date().getMonth() + 1
          }/${file.name}`;

          // Generate signed URL for private access
          const signedUrl = await generateSignedUrl(filePath);

          return {
            id: nanoid(),
            name: file.name,
            mimeType: file.type,
            size: file.size,
            url: signedUrl,
            // Store the file path for future signed URL generation
            filePath: filePath,
            type: file.type.startsWith("image/") ? "image" : "document",
          };
        })
      );

      onAttachmentsChange([...attachments, ...newAttachments]);
      setShowDropzone(false);
      upload.setFiles([]);
    } catch (error) {
      console.error("Error handling upload success:", error);
      toast.error("Error adding attachments");
    }
  }, [attachments, onAttachmentsChange, upload]);

  const handleRemoveAttachment = useCallback(
    (attachmentId: string) => {
      try {
        onAttachmentsChange(
          attachments.filter((att) => att.id !== attachmentId)
        );
      } catch (error) {
        console.error("Error removing attachment:", error);
      }
    },
    [attachments, onAttachmentsChange]
  );

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 sm:h-4 sm:w-4" />;
    }
    return <FileText className="h-5 w-5 sm:h-4 sm:w-4" />;
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

  // Don't render if model doesn't support attachments
  if (!supportsAttachments) {
    return null;
  }

  return (
    <div className={cn("space-y-3 sm:space-y-2", className)}>
      {/* Existing attachments */}
      {attachments.length > 0 && (
        <div className="space-y-3 sm:space-y-2">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="border-dashed">
              <CardContent className="p-4 sm:p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      {getFileTypeIcon(attachment.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-sm font-medium truncate leading-relaxed">
                        {attachment.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 sm:mt-1">
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-1"
                        >
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
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    disabled={disabled}
                    className="h-10 w-10 sm:h-8 sm:w-8 p-0 flex-shrink-0 rounded-full hover:bg-destructive/10"
                    aria-label={`Remove ${attachment.name}`}
                  >
                    <X className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload button */}
      {!showDropzone && (
        <Button
          variant="outline"
          size="default"
          onClick={() => setShowDropzone(true)}
          disabled={disabled || attachments.length >= 5}
          className="w-full h-12 sm:h-10 text-sm sm:text-sm"
        >
          <Paperclip className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
          <span className="truncate">
            Attach Files
            {modelCapabilities.supportsImages &&
            modelCapabilities.supportsDocuments
              ? " (Images & PDFs)"
              : modelCapabilities.supportsImages
              ? " (Images)"
              : " (Documents)"}
          </span>
        </Button>
      )}

      {/* Dropzone */}
      {showDropzone && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <Dropzone
              {...upload}
              className="border-0 p-0 bg-transparent min-h-[120px] sm:min-h-[100px]"
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-2 mt-4 sm:mt-3">
              <Button
                variant="ghost"
                size="default"
                onClick={() => {
                  setShowDropzone(false);
                  upload.setFiles([]);
                }}
                className="h-10 sm:h-auto order-2 sm:order-1"
              >
                Cancel
              </Button>

              {upload.isSuccess && (
                <Button
                  size="default"
                  onClick={handleUploadSuccess}
                  className="h-10 sm:h-auto order-1 sm:order-2"
                >
                  Add to Message
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capability info */}
      <div className="text-xs text-muted-foreground px-1 leading-relaxed">
        {modelCapabilities.supportsImages &&
        modelCapabilities.supportsDocuments ? (
          <>
            Supports images (
            {formatBytes(modelCapabilities.maxImageSize! * 1024 * 1024)}) and
            PDFs (
            {formatBytes(modelCapabilities.maxDocumentSize! * 1024 * 1024)})
          </>
        ) : modelCapabilities.supportsImages ? (
          <>
            Supports images up to{" "}
            {formatBytes(modelCapabilities.maxImageSize! * 1024 * 1024)}
          </>
        ) : (
          <>
            Supports documents up to{" "}
            {formatBytes(modelCapabilities.maxDocumentSize! * 1024 * 1024)}
          </>
        )}
      </div>
    </div>
  );
}
