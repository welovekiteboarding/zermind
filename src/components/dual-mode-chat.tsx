"use client";

import React, { useState, useCallback } from "react";
import { ChatConversation } from "@/components/chat-conversation";
import { MindMapView } from "@/components/mind-map/mind-map-view";
import { useChatModeStore } from "@/lib/store/chat-mode-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, GitBranch, ArrowLeft } from "lucide-react";

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

  // Handle resuming conversation from a specific node
  const handleResumeConversation = useCallback((nodeId: string) => {
    setResumeFromNodeId(nodeId);
    // TODO: Implement the logic to resume conversation from this node
    console.log("Resuming conversation from node:", nodeId);
  }, []);

  // Handle creating a new branch from a node
  const handleCreateBranch = useCallback((parentNodeId: string) => {
    // TODO: Implement the logic to create a new conversation branch
    console.log("Creating branch from node:", parentNodeId);
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

              {resumeFromNodeId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setResumeFromNodeId(null)}
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Clear Resume
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

        {/* Resume Conversation Panel (when a node is selected for resumption) */}
        {resumeFromNodeId && (
          <div className="border-t bg-background p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">
                Resume from node: {resumeFromNodeId}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Continue the conversation from this point. Your new messages will
              branch from here.
            </p>
            {/* TODO: Add message input here for resuming conversation */}
            <div className="bg-muted rounded-md p-3 text-sm text-muted-foreground">
              Message input will be implemented here...
            </div>
          </div>
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
            attachments: [],
          }))}
          userId={userId}
          chatTitle={chatTitle}
        />
      </div>
    </div>
  );
}
