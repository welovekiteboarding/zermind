"use client";

import { useChatWithMessages } from "@/hooks/use-chats-query";

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
  // Use React Query to get the latest chat data
  const { data: chatData } = useChatWithMessages(chatId, userId);
  
  // Use the latest data if available, otherwise fall back to initial data
  const title = chatData?.title || initialTitle || "New Chat";
  const updatedAt = chatData?.updatedAt || initialUpdatedAt || new Date();

  return (
    <div className="border-b p-4 bg-background/50 backdrop-blur">
      <h1 className="text-lg font-semibold truncate">{title}</h1>
      <p className="text-sm text-muted-foreground">
        Last updated: {formatDate(updatedAt)}
      </p>
    </div>
  );
} 