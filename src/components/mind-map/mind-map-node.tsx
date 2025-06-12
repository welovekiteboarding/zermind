"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, User, Plus, GitBranch, Play } from "lucide-react";

export interface ConversationNodeData extends Record<string, unknown> {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  branchName?: string;
  nodeType?: "conversation" | "branching_point" | "insight";
  onResumeConversation?: (nodeId: string) => void;
  onCreateBranch?: (nodeId: string) => void;
}

export const ConversationNode = memo(({ data, selected }: NodeProps & { data: ConversationNodeData }) => {
  const {
    role,
    content,
    model,
    branchName,
    nodeType,
    onResumeConversation,
    onCreateBranch,
  } = data;

  const isUser = role === "user";
  const truncatedContent =
    content.length > 100 ? content.slice(0, 100) + "..." : content;

  return (
    <div className={`conversation-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-border"
      />

      <Card
        className={`w-80 shadow-md border-2 transition-all ${
          selected
            ? "border-purple-500 shadow-lg"
            : "border-border hover:border-purple-300"
        } ${
          isUser
            ? "bg-blue-50 dark:bg-blue-950/20"
            : "bg-green-50 dark:bg-green-950/20"
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isUser ? (
                <User className="h-4 w-4 text-blue-600" />
              ) : (
                <Bot className="h-4 w-4 text-green-600" />
              )}
              <span className="text-sm font-medium">
                {isUser ? "You" : model || "Assistant"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {branchName && (
                <Badge variant="outline" className="text-xs">
                  {branchName}
                </Badge>
              )}

              {nodeType === "branching_point" && (
                <Badge variant="secondary" className="text-xs">
                  <GitBranch className="h-3 w-3 mr-1" />
                  Branch
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
            {truncatedContent}
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResumeConversation?.(data.id)}
              className="flex-1"
            >
              <Play className="h-3 w-3 mr-1" />
              Resume
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onCreateBranch?.(data.id)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-border"
      />
    </div>
  );
});

ConversationNode.displayName = "ConversationNode";
