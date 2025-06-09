"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  MessageSquare,
  StopCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Message } from "@/lib/schemas/chat";
import { useChat } from "@/hooks/use-chat";
import { ModelSelector } from "@/components/model-selector";
import { useSaveMessage, useUpdateChatTitle } from "@/hooks/use-chats-query";
import { generateChatTitle, shouldUpdateChatTitle } from "@/lib/utils/chat-utils";

interface ChatConversationProps {
  chatId: string;
  initialMessages: Message[];
  userId: string;
  chatTitle?: string;
  model?: string;
}

export function ChatConversation({
  chatId,
  initialMessages,
  userId, // eslint-disable-line @typescript-eslint/no-unused-vars
  chatTitle,
  model: initialModel = "openai/gpt-4o-mini",
}: ChatConversationProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TanStack Query mutations
  const saveMessageMutation = useSaveMessage();
  const updateChatTitleMutation = useUpdateChatTitle();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    sendMessage,
  } = useChat({
    chatId,
    initialMessages,
    model: selectedModel,
    onFinish: (message) => {
      // Save assistant message to database
      saveMessageMutation.mutate({
        chatId,
        message: {
          role: message.role,
          content: message.content,
          model: message.model,
        }
      });
      console.log("Message finished:", message);
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!input.trim() || isLoading) return;

    try {
      const userMessage = input.trim();
      
      // Check if this is the first user message and title should be updated
      const isFirstMessage = messages.length === 0 || 
        messages.every(msg => msg.role === 'assistant');
      
      const shouldUpdateTitle = isFirstMessage && shouldUpdateChatTitle(chatTitle || null);
      
      // Send the message
      await sendMessage(userMessage);
      
      // Save user message to database
      await saveMessageMutation.mutateAsync({
        chatId,
        message: {
          role: 'user',
          content: userMessage,
          model: null, // User messages don't have a model
        }
      });

      // Update chat title if this is the first user message
      if (shouldUpdateTitle) {
        try {
          const newTitle = generateChatTitle(userMessage);
          await updateChatTitleMutation.mutateAsync({
            chatId,
            data: { title: newTitle }
          });
        } catch (error) {
          console.error("Failed to update chat title:", error);
          // Don't block the conversation if title update fails
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatTime = (createdAt: Date) => {
    return createdAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Error Display */}
        {error && (
          <div className="flex items-center justify-center mb-4">
            <Card className="border-destructive bg-destructive/10 max-w-md">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Error occurred</p>
                    <p className="text-xs mt-1">{error.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Start the conversation</h3>
              <p className="text-sm text-muted-foreground">
                Send a message to begin chatting with AI
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Using: {selectedModel}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <Card
                  className={cn(
                    "max-w-[80%] md:max-w-[70%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="whitespace-pre-wrap break-words text-sm">
                          {message.content}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              message.role === "user"
                                ? "border-primary-foreground/20 text-primary-foreground/70"
                                : "border-muted-foreground/20 text-muted-foreground"
                            )}
                          >
                            {formatTime(message.createdAt)}
                          </Badge>
                          {message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-background/20"
                              onClick={() =>
                                copyToClipboard(message.content, message.id)
                              }
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-muted max-w-[80%] md:max-w-[70%]">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-background/50 backdrop-blur space-y-3">
        {/* Model Selector */}
        <div className="flex justify-start">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isLoading}
            className="w-full max-w-xs"
          />
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
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
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
