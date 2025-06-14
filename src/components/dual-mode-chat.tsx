"use client";

import React, { useState, useCallback } from "react";
import { ChatConversation } from "@/components/chat-conversation";
import { MindMapView } from "@/components/mind-map/mind-map-view";
import { ResumeMessageInput } from "@/components/resume-message-input";
import { CreateBranchInput } from "@/components/create-branch-input";
import { useChatModeStore } from "@/lib/store/chat-mode-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  parentId?: string;
  branchName?: string;
  xPosition?: number;
  yPosition?: number;
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

export function DualModeChat({
  chatId,
  initialMessages,
  userId,
  chatTitle,
}: DualModeChatProps) {
  const { mode } = useChatModeStore();
  const [resumeFromNodeId, setResumeFromNodeId] = useState<string | null>(null);
  const [createBranchFromNodeId, setCreateBranchFromNodeId] = useState<
    string | null
  >(null);

  // Handle resuming conversation from a specific node
  const handleResumeConversation = useCallback((nodeId: string) => {
    setResumeFromNodeId(nodeId);
    setCreateBranchFromNodeId(null); // Clear branch creation if active
    console.log("Resuming conversation from node:", nodeId);
  }, []);

  // Handle creating a new branch from a node
  const handleCreateBranch = useCallback((parentNodeId: string) => {
    setCreateBranchFromNodeId(parentNodeId);
    setResumeFromNodeId(null); // Clear resume if active
    console.log("Creating branch from node:", parentNodeId);
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

  // Convert traditional messages to mind map format
  const mindMapMessages = initialMessages.map((msg, index) => ({
    ...msg,
    xPosition: msg.xPosition || (index % 3) * 400,
    yPosition: msg.yPosition || Math.floor(index / 3) * 250,
  }));

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

              {(resumeFromNodeId || createBranchFromNodeId) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setResumeFromNodeId(null);
                    setCreateBranchFromNodeId(null);
                  }}
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Clear Action
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mind Map View */}
        <div className="flex-1 overflow-hidden">
          <MindMapView
            messages={mindMapMessages}
            onResumeConversation={handleResumeConversation}
            onCreateBranch={handleCreateBranch}
          />
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

          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Chat Mode
          </Badge>
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
          }))}
          userId={userId}
          chatTitle={chatTitle}
        />
      </div>
    </div>
  );
}
