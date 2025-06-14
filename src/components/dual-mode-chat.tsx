"use client";

import React, { useState, useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChatConversation } from "@/components/chat-conversation";
import { MindMapView } from "@/components/mind-map/mind-map-view";
import { ResumeMessageInput } from "@/components/resume-message-input";
import { CreateBranchInput } from "@/components/create-branch-input";
import { CreateMultiModelBranch } from "@/components/create-multi-model-branch";
import { useChatModeStore } from "@/lib/store/chat-mode-store";
import { useAuthUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, ArrowLeft } from "lucide-react";
import { CollaborationButton } from "@/components/collaboration/collaboration-button";
import {
  RealtimeCursors,
  CollaborationPresence,
} from "@/components/mind-map/realtime-cursors";
import { useRealtimeCollaboration } from "@/hooks/use-realtime-collaboration";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  parentId?: string;
  branchName?: string;
  xPosition?: number;
  yPosition?: number;
  nodeType?: "conversation" | "branching_point" | "insight";
  isCollapsed?: boolean;
  isLocked?: boolean;
  lastEditedBy?: string;
  editedAt?: string;
  createdAt: string;
  attachments?: Array<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
    url: string;
    filePath?: string;
    type: "image" | "document";
  }>;
}

interface DualModeChatProps {
  chatId: string;
  initialMessages: Message[];
  userId: string;
  chatTitle?: string;
}

// Error handler for collaboration features
function handleCollaborationError(error: Error, errorInfo: unknown) {
  // Log the error for debugging purposes
  console.warn(
    "Collaboration Error Boundary caught an error:",
    error,
    errorInfo
  );

  // You can also log the error to an error reporting service here
  // Example: errorReportingService.captureException(error, { extra: errorInfo });
}

// Fallback component for collaboration errors (silently fail)
function CollaborationErrorFallback() {
  return null; // Silently fail collaboration features without breaking the rest of the app
}

export function DualModeChat({
  chatId,
  initialMessages,
  userId,
  chatTitle,
}: DualModeChatProps) {
  const { mode } = useChatModeStore();
  const { user } = useAuthUser();
  const [resumeFromNodeId, setResumeFromNodeId] = useState<string | null>(null);
  const [createBranchFromNodeId, setCreateBranchFromNodeId] = useState<
    string | null
  >(null);
  const [createMultiModelFromNodeId, setCreateMultiModelFromNodeId] = useState<
    string | null
  >(null);

  // Get display name from user data with fallback
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      // Extract name from email (before @ symbol) as fallback
      return user.email.split("@")[0];
    }
    return "User"; // Final fallback
  };

  // Real-time collaboration hook - ALWAYS called at top level (Rules of Hooks)
  const collaborationState = useRealtimeCollaboration({
    chatId,
    userId,
    userName: getUserDisplayName(),
    onAction: (action) => {
      console.log("Received collaborative action:", action);
      // Handle collaborative actions here
    },
    onPresenceChange: (users) => {
      console.log("Collaboration presence changed:", users);
    },
  });

  // Safely extract values with defaults
  const { collaborativeUsers = [], isConnected: isRealtimeConnected = false } =
    collaborationState || { collaborativeUsers: [], isConnected: false };

  // Handle resuming conversation from a specific node
  const handleResumeConversation = useCallback((nodeId: string) => {
    setResumeFromNodeId(nodeId);
    setCreateBranchFromNodeId(null); // Clear branch creation if active
    setCreateMultiModelFromNodeId(null); // Clear multi-model creation if active
    console.log("Resuming conversation from node:", nodeId);
  }, []);

  // Handle creating a new branch from a node
  const handleCreateBranch = useCallback((parentNodeId: string) => {
    setCreateBranchFromNodeId(parentNodeId);
    setResumeFromNodeId(null); // Clear resume if active
    setCreateMultiModelFromNodeId(null); // Clear multi-model creation if active
    console.log("Creating branch from node:", parentNodeId);
  }, []);

  // Handle creating a multi-model comparison branch
  const handleCreateMultiModelBranch = useCallback((parentNodeId: string) => {
    setCreateMultiModelFromNodeId(parentNodeId);
    setResumeFromNodeId(null); // Clear resume if active
    setCreateBranchFromNodeId(null); // Clear single branch creation if active
    console.log("Creating multi-model branch from node:", parentNodeId);
  }, []);

  // Handle successful message sent in resume mode
  const handleResumeMessageSent = useCallback(() => {
    // Refresh the mind map to show new messages
    // This will be handled by the query invalidation in the useSaveMessage hook
    console.log("Resume message sent successfully");
  }, []);

  // Handle successful branch creation
  const handleBranchCreated = useCallback(() => {
    // Refresh the mind map to show new branch
    console.log("Branch created successfully");
  }, []);

  // Handle successful multi-model branch creation
  const handleMultiModelBranchCreated = useCallback(() => {
    // Refresh the mind map to show new multi-model branches
    console.log("Multi-model branch created successfully");
  }, []);

  // Clear all active actions
  const clearAllActions = useCallback(() => {
    setResumeFromNodeId(null);
    setCreateBranchFromNodeId(null);
    setCreateMultiModelFromNodeId(null);
  }, []);

  // Convert traditional messages to mind map format
  const mindMapMessages = initialMessages.map((msg, index) => ({
    ...msg,
    xPosition: msg.xPosition || (index % 3) * 400,
    yPosition: msg.yPosition || Math.floor(index / 3) * 250,
  }));

  // Check if any action is active
  const hasActiveAction =
    resumeFromNodeId || createBranchFromNodeId || createMultiModelFromNodeId;

  if (mode === "mind") {
    return (
      <div className="flex flex-col h-full">
        {/* Mind Mode Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <h2 className="font-semibold">
                  {chatTitle || "Mind Map Chat"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Interactive conversation visualization
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              >
                <Brain className="h-3 w-3 mr-1" />
                Mind Mode
              </Badge>

              {/* Collaboration Controls */}
              <ErrorBoundary
                FallbackComponent={CollaborationErrorFallback}
                onError={handleCollaborationError}
              >
                <CollaborationButton
                  chatId={chatId}
                  chatTitle={chatTitle}
                  currentUserRole="owner"
                  isRealtimeConnected={isRealtimeConnected}
                />
              </ErrorBoundary>

              {/* Clear Actions Button */}
              {hasActiveAction && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAllActions}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span className="hidden sm:inline">Clear Action</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Collaboration Presence Indicator */}
        {collaborativeUsers.length > 0 && (
          <ErrorBoundary
            FallbackComponent={CollaborationErrorFallback}
            onError={handleCollaborationError}
          >
            <div className="px-4 py-2 border-b bg-muted/30">
              <CollaborationPresence users={collaborativeUsers} />
            </div>
          </ErrorBoundary>
        )}

        {/* Mind Map View */}
        <div className="flex-1 overflow-hidden relative">
          <MindMapView
            messages={mindMapMessages}
            onResumeConversation={handleResumeConversation}
            onCreateBranch={handleCreateBranch}
            onCreateMultiModelBranch={handleCreateMultiModelBranch}
          />

          {/* Real-time Cursors Overlay */}
          {collaborativeUsers.length > 0 && (
            <ErrorBoundary
              FallbackComponent={CollaborationErrorFallback}
              onError={handleCollaborationError}
            >
              <RealtimeCursors users={collaborativeUsers} />
            </ErrorBoundary>
          )}
        </div>

        {/* Resume Conversation Panel */}
        {resumeFromNodeId && (
          <ResumeMessageInput
            chatId={chatId}
            parentNodeId={resumeFromNodeId}
            onClose={() => setResumeFromNodeId(null)}
            onMessageSent={handleResumeMessageSent}
          />
        )}

        {/* Create Branch Panel */}
        {createBranchFromNodeId && (
          <CreateBranchInput
            chatId={chatId}
            parentNodeId={createBranchFromNodeId}
            onClose={() => setCreateBranchFromNodeId(null)}
            onBranchCreated={handleBranchCreated}
          />
        )}

        {/* Create Multi-Model Branch Panel */}
        {createMultiModelFromNodeId && (
          <CreateMultiModelBranch
            chatId={chatId}
            parentNodeId={createMultiModelFromNodeId}
            onClose={() => setCreateMultiModelFromNodeId(null)}
            onBranchCreated={handleMultiModelBranchCreated}
          />
        )}
      </div>
    );
  }

  // Traditional Chat Mode
  return (
    <div className="flex flex-col h-full">
      {/* Chat Mode Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <div>
              <h2 className="font-semibold">{chatTitle || "Chat"}</h2>
              <p className="text-xs text-muted-foreground">
                Traditional linear conversation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat Mode
            </Badge>

            {/* Collaboration Controls */}
            <ErrorBoundary
              FallbackComponent={CollaborationErrorFallback}
              onError={handleCollaborationError}
            >
              <CollaborationButton
                chatId={chatId}
                chatTitle={chatTitle}
                currentUserRole="owner"
                isRealtimeConnected={isRealtimeConnected}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Traditional Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatConversation
          chatId={chatId}
          initialMessages={initialMessages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant",
            createdAt: new Date(msg.createdAt),
            attachments: msg.attachments || [],
            xPosition: msg.xPosition || 0,
            yPosition: msg.yPosition || 0,
            nodeType: msg.nodeType || "conversation",
            isCollapsed: msg.isCollapsed || false,
            isLocked: msg.isLocked || false,
            editedAt: msg.editedAt ? new Date(msg.editedAt) : undefined,
          }))}
          userId={userId}
          chatTitle={chatTitle}
        />
      </div>
    </div>
  );
}
