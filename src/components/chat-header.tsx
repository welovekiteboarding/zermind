"use client";

import { useState } from "react";
import { useChatWithMessages } from "@/hooks/use-chats-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Share, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ChatHeaderProps {
  chatId: string;
  userId: string;
  initialTitle?: string | null;
  initialUpdatedAt?: Date;
}

// Helper function to format date consistently across server and client
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function ChatHeader({ 
  chatId, 
  userId, 
  initialTitle, 
  initialUpdatedAt 
}: ChatHeaderProps) {
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [isRemovingShare, setIsRemovingShare] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Use React Query to get the latest chat data
  const { data: chatData, refetch } = useChatWithMessages(chatId, userId);
  
  // Use the latest data if available, otherwise fall back to initial data
  const title = chatData?.title || initialTitle || "New Chat";
  const updatedAt = chatData?.updatedAt || initialUpdatedAt || new Date();
  const shareId = chatData?.shareId;

  const generateShareLink = async () => {
    setIsGeneratingShare(true);
    try {
      const response = await fetch(`/api/chats/${chatId}/share`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const data = await response.json();
      
      // Copy to clipboard
      await navigator.clipboard.writeText(data.shareUrl);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
      
      toast.success("Share link generated and copied to clipboard!");
      
      // Refresh chat data to get the new shareId
      refetch();
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error("Failed to generate share link");
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareId) return;
    
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      console.error('Error copying share link:', error);
      toast.error("Failed to copy share link");
    }
  };

  const removeShareLink = async () => {
    setIsRemovingShare(true);
    try {
      const response = await fetch(`/api/chats/${chatId}/share`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove share link');
      }

      toast.success("Share link removed");
      
      // Refresh chat data to remove the shareId
      refetch();
    } catch (error) {
      console.error('Error removing share link:', error);
      toast.error("Failed to remove share link");
    } finally {
      setIsRemovingShare(false);
    }
  };

  const openShareLink = () => {
    if (!shareId) return;
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="border-b p-4 bg-background/50 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              Last updated: {formatDate(updatedAt)}
            </p>
            {shareId && (
              <Badge variant="secondary" className="text-xs">
                <Share className="h-3 w-3 mr-1" />
                Shared
              </Badge>
            )}
          </div>
        </div>

        {/* Share Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={shareId ? "secondary" : "outline"} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Share className="h-4 w-4" />
              {shareId ? "Shared" : "Share"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {!shareId ? (
              <DropdownMenuItem 
                onClick={generateShareLink}
                disabled={isGeneratingShare}
              >
                <Share className="h-4 w-4 mr-2" />
                {isGeneratingShare ? "Generating..." : "Create share link"}
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={copyShareLink}>
                  {copiedToClipboard ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copiedToClipboard ? "Copied!" : "Copy share link"}
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={openShareLink}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open shared view
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={removeShareLink}
                  disabled={isRemovingShare}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isRemovingShare ? "Removing..." : "Remove share link"}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 