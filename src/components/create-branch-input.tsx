"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Send,
  StopCircle,
  AlertCircle,
  User,
  Bot,
  GitBranch,
} from "lucide-react";
import { useBranchingChat } from "@/hooks/use-branching-chat";
import { type Message } from "@/lib/schemas/chat";
import { ModelSelector } from "@/components/model-selector";

interface CreateBranchInputProps {
  chatId: string;
  parentNodeId: string;
  onClose: () => void;
  onBranchCreated?: () => void;
}

export function CreateBranchInput({
  chatId,
  parentNodeId,
  onClose,
  onBranchCreated,
}: CreateBranchInputProps) {
  const [context, setContext] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [branchName, setBranchName] = useState("");
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [contextError, setContextError] = useState<string | null>(null);

  // Fetch conversation context for the node
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const response = await fetch(
          `/api/chats/${chatId}/context/${parentNodeId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch conversation context");
        }
        const data = await response.json();
        setContext(
          data.context.map(
            (msg: {
              id: string;
              role: string;
              content: string;
              model: string | null;
              createdAt: string;
            }) => ({
              ...msg,
              role: msg.role as "user" | "assistant",
              createdAt: new Date(msg.createdAt),
              attachments: [],
            })
          )
        );
      } catch (error) {
        console.error("Error fetching context:", error);
        setContextError("Failed to load conversation context");
      } finally {
        setIsLoadingContext(false);
      }
    };

    fetchContext();
  }, [chatId, parentNodeId]);

  const {
    input,
    messages,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
    stop,
  } = useBranchingChat({
    chatId,
    parentNodeId,
    initialContext: context,
    model: selectedModel,
    branchName: branchName.trim() || undefined,
    onFinish: () => {
      onBranchCreated?.();
    },
  });

  if (isLoadingContext) {
    return (
      <Card className="border-t bg-background">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            <span className="text-sm text-muted-foreground ml-2">
              Loading conversation context...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contextError) {
    return (
      <Card className="border-t bg-background border-destructive">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{contextError}</span>
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-t bg-background">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-orange-500" />
            <h4 className="text-sm font-medium">Create New Branch</h4>
          </div>
          <Badge variant="outline" className="text-xs">
            From node: {parentNodeId.slice(0, 8)}...
          </Badge>
        </div>

        {/* Context Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Branching from:
            </Label>
            <Badge variant="outline" className="text-xs">
              {context.length} message{context.length !== 1 ? "s" : ""} in
              context
            </Badge>
          </div>

          {context.length > 0 && (
            <div className="bg-muted rounded-md p-3 max-h-24 overflow-y-auto">
              <div className="text-xs text-muted-foreground space-y-1">
                {context.slice(-1).map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    {msg.role === "user" ? (
                      <User className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Bot className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-xs">
                      {msg.content.length > 80
                        ? msg.content.substring(0, 80) + "..."
                        : msg.content}
                    </span>
                  </div>
                ))}
                {context.length > 1 && (
                  <div className="text-center text-xs text-muted-foreground/70">
                    ... and {context.length - 1} more message
                    {context.length - 1 !== 1 ? "s" : ""} before this
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Branch Messages */}
        {messages.length > context.length && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <Label className="text-xs text-muted-foreground">
              New branch messages:
            </Label>
            {messages.slice(context.length).map((message) => (
              <Card
                key={message.id}
                className={`${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <CardContent className="p-2">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error.message}</span>
          </div>
        )}

        {/* Branch Configuration */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="branch-name" className="text-sm">
              Branch Name (optional)
            </Label>
            <Input
              id="branch-name"
              placeholder="e.g., Alternative approach, Different perspective..."
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              disabled={isLoading}
            />
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              placeholder="Start the new branch with a different question or approach..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {isLoading ? (
              <Button
                type="button"
                onClick={stop}
                size="icon"
                variant="destructive"
                className="flex-shrink-0"
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!input.trim()}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Create a new conversation path from this point • Press Enter to send
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
