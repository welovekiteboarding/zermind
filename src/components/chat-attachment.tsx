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

  const handleUploadSuccess = useCallback(() => {
    const newAttachments: Attachment[] = upload.files.map((file) => ({
      id: nanoid(),
      name: file.name,
      mimeType: file.type,
      size: file.size,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/chat-attachments/uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${file.name}`,
      type: file.type.startsWith("image/") ? "image" : "document",
    }));

    onAttachmentsChange([...attachments, ...newAttachments]);
    setShowDropzone(false);
    upload.setFiles([]);
  }, [attachments, onAttachmentsChange, upload]);

  const handleRemoveAttachment = useCallback(
    (attachmentId: string) => {
      onAttachmentsChange(attachments.filter((att) => att.id !== attachmentId));
    },
    [attachments, onAttachmentsChange]
  );

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

  // Don't render if model doesn't support attachments
  if (!supportsAttachments) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Existing attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="border-dashed">
              <CardContent className="p-3">
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
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
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
          size="sm"
          onClick={() => setShowDropzone(true)}
          disabled={disabled || attachments.length >= 5}
          className="w-full"
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Attach Files
          {modelCapabilities.supportsImages && modelCapabilities.supportsDocuments
            ? " (Images & PDFs)"
            : modelCapabilities.supportsImages
            ? " (Images)"
            : " (Documents)"}
        </Button>
      )}

      {/* Dropzone */}
      {showDropzone && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <Dropzone {...upload} className="border-0 p-0 bg-transparent">
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
            
            <div className="flex justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDropzone(false);
                  upload.setFiles([]);
                }}
              >
                Cancel
              </Button>
              
              {upload.isSuccess && (
                <Button size="sm" onClick={handleUploadSuccess}>
                  Add to Message
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capability info */}
      <div className="text-xs text-muted-foreground">
        {modelCapabilities.supportsImages && modelCapabilities.supportsDocuments ? (
          <>Supports images ({formatBytes(modelCapabilities.maxImageSize! * 1024 * 1024)}) and PDFs ({formatBytes(modelCapabilities.maxDocumentSize! * 1024 * 1024)})</>
        ) : modelCapabilities.supportsImages ? (
          <>Supports images up to {formatBytes(modelCapabilities.maxImageSize! * 1024 * 1024)}</>
        ) : (
          <>Supports documents up to {formatBytes(modelCapabilities.maxDocumentSize! * 1024 * 1024)}</>
        )}
      </div>
    </div>
  );
} 