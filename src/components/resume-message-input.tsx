"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, StopCircle, AlertCircle, User, Bot } from "lucide-react";
import { useBranchingChat } from "@/hooks/use-branching-chat";
import { type Message } from "@/lib/schemas/chat";
import { ModelSelector } from "@/components/model-selector";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const messageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long (max 4000 characters)")
    .trim(),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface ResumeMessageInputProps {
  chatId: string;
  parentNodeId: string;
  onClose: () => void;
  onMessageSent?: () => void;
}

export function ResumeMessageInput({
  chatId,
  parentNodeId,
  onClose,
  onMessageSent,
}: ResumeMessageInputProps) {
  const [context, setContext] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [contextError, setContextError] = useState<string | null>(null);

  // Form setup
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

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
    onFinish: () => {
      onMessageSent?.();
    },
  });

  const handleMessageSubmit = async (data: MessageFormData) => {
    if (!data.message.trim() || isLoading) return;

    try {
      // First update the input state in the hook
      const syntheticEvent = {
        target: { value: data.message.trim() },
      } as React.ChangeEvent<HTMLInputElement>;

      handleInputChange(syntheticEvent);

      // Then submit after a small delay to ensure state is updated
      setTimeout(() => {
        const mockEvent = {
          preventDefault: () => {},
          type: "submit",
        } as React.FormEvent<HTMLFormElement>;
        handleSubmit(mockEvent);
      }, 0);
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

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
        {/* Context Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Resuming from:</h4>
            <Badge variant="outline" className="text-xs">
              {context.length} message{context.length !== 1 ? "s" : ""} in
              context
            </Badge>
          </div>

          {context.length > 0 && (
            <div className="bg-muted rounded-md p-3 max-h-32 overflow-y-auto">
              <div className="text-xs text-muted-foreground space-y-1">
                {context.slice(-2).map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    {msg.role === "user" ? (
                      <User className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Bot className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-xs">
                      {msg.content.length > 60
                        ? msg.content.substring(0, 60) + "..."
                        : msg.content}
                    </span>
                  </div>
                ))}
                {context.length > 2 && (
                  <div className="text-center text-xs text-muted-foreground/70">
                    ... and {context.length - 2} more message
                    {context.length - 2 !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Messages from Branch */}
        {messages.length > context.length && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {messages.slice(context.length).map((message) => (
              <Card
                key={message.id}
                className={`${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-muted mr-8"
                }`}
              >
                <CardContent className="p-2">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {message.role === "user" ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
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

        {/* Input Controls */}
        <div className="space-y-3">
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

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleMessageSubmit)}
              className="flex space-x-2"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Continue the conversation..."
                        disabled={isLoading}
                        {...field}
                        value={input} // Keep sync with useBranchingChat input
                        onChange={(e) => {
                          field.onChange(e);
                          handleInputChange(e); // Keep useBranchingChat in sync
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(handleMessageSubmit)();
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
                  disabled={!form.watch("message")?.trim()}
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </form>
          </Form>

          <p className="text-xs text-muted-foreground text-center">
            Your message will branch from the selected node • Press Enter to
            send
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
