import { createClient } from "@/lib/supabase/client";
import { type Attachment } from "@/lib/schemas/chat";

/**
 * Refresh signed URLs for attachments when they expire
 */
export async function refreshAttachmentUrls(
  attachments: Attachment[]
): Promise<Attachment[]> {
  const supabase = createClient();

  const refreshPromises = attachments.map(async (attachment) => {
    // If no filePath, return as-is (legacy attachments)
    if (!attachment.filePath) {
      return attachment;
    }

    try {
      const { data, error } = await supabase.storage
        .from("chat-attachments")
        .createSignedUrl(attachment.filePath, 3600); // 1 hour expiry

      if (error) {
        console.error(
          `Failed to refresh signed URL for ${attachment.name}:`,
          error
        );
        return attachment; // Return original if refresh fails
      }

      return {
        ...attachment,
        url: data.signedUrl,
      };
    } catch (error) {
      console.error(
        `Error refreshing signed URL for ${attachment.name}:`,
        error
      );
      return attachment; // Return original if refresh fails
    }
  });

  return Promise.all(refreshPromises);
}

/**
 * Check if an attachment URL is likely expired (simple heuristic)
 */
export function isAttachmentUrlExpired(attachment: Attachment): boolean {
  if (!attachment.filePath) {
    return false; // Legacy attachments don't expire
  }

  // Check if URL contains Supabase signed URL parameters
  const url = new URL(attachment.url);
  const expires = url.searchParams.get("Expires");

  if (expires) {
    const expiryTime = parseInt(expires) * 1000; // Convert to milliseconds
    return Date.now() > expiryTime;
  }

  // If no expiry info, assume it might be expired after 1 hour
  return false;
}

/**
 * Generate a unique filename to avoid conflicts
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");

  return `${nameWithoutExtension}_${timestamp}_${random}.${extension}`;
}

/**
 * Validate file before upload
 */
export function validateFileForUpload(
  file: File,
  allowedMimeTypes: string[],
  maxFileSize: number
): { isValid: boolean; error?: string } {
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${
        file.type
      } is not supported. Allowed types: ${allowedMimeTypes.join(", ")}`,
    };
  }

  if (file.size > maxFileSize) {
    const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File is too large. Maximum size is ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Clean up expired attachments from storage (admin function)
 */
export async function cleanupExpiredAttachments(
  olderThanDays: number = 30
): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  try {
    // This would typically be done server-side with proper admin permissions
    // For now, this is a placeholder for the cleanup logic
    console.log(
      `Cleanup logic for attachments older than ${cutoffDate.toISOString()}`
    );
  } catch (error) {
    console.error("Failed to cleanup expired attachments:", error);
  }
}
