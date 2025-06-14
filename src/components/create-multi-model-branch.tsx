"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  StopCircle,
  AlertCircle,
  User,
  Bot,
  Zap,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useBranchingChat } from "@/hooks/use-branching-chat";
import { useConversationContext } from "@/hooks/use-conversation-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getProviderFromModel, getProviderDisplayName, getModelDisplayName } from "@/lib/utils/model-utils";

// Available models for multi-model comparison
const COMPARISON_MODELS = [
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", tier: "premium" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", tier: "standard" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", tier: "premium" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", tier: "standard" },
  { id: "meta-llama/llama-3.1-405b-instruct", name: "Llama 3.1 405B", provider: "Meta", tier: "premium" },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "Meta", tier: "standard" },
];

const multiModelFormSchema = z.object({
  branchName: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 3, {
      message: "Branch name must be at least 3 characters if provided",
    }),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long"),
  selectedModels: z
    .array(z.string())
    .min(2, "Please select at least 2 models for comparison")
    .max(4, "Maximum 4 models allowed for comparison"),
});

type MultiModelFormData = z.infer<typeof multiModelFormSchema>;

interface CreateMultiModelBranchProps {
  chatId: string;
  parentNodeId: string;
  onClose: () => void;
  onBranchCreated?: () => void;
}

interface ModelBranchStatus {
  model: string;
  status: "pending" | "loading" | "success" | "error";
  error?: string;
}

export function CreateMultiModelBranch({
  chatId,
  parentNodeId,
  onClose,
  onBranchCreated,
}: CreateMultiModelBranchProps) {
  const [modelStatuses, setModelStatuses] = useState<ModelBranchStatus[]>([]);

  // Form setup
  const form = useForm<MultiModelFormData>({
    resolver: zodResolver(multiModelFormSchema),
    defaultValues: {
      branchName: "",
      message: "",
      selectedModels: ["openai/gpt-4o-mini", "anthropic/claude-3-haiku"], // Default selection
    },
  });

  // Fetch conversation context
  const {
    data: context = [],
    isLoading: isLoadingContext,
    error: contextError,
  } = useConversationContext(chatId, parentNodeId);

  // Track multiple branching chat instances
  const branchingChats = form.watch("selectedModels").map((model) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useBranchingChat({
      chatId,
      parentNodeId,
      initialContext: context,
      model,
      branchName: form.watch("branchName")?.trim() || `${getProviderDisplayName(getProviderFromModel(model))} Response`,
      onFinish: () => {
        setModelStatuses(prev => 
          prev.map(status => 
            status.model === model 
              ? { ...status, status: "success" }
              : status
          )
        );
        
        // Check if all models are done
        const allDone = modelStatuses.every(s => 
          s.status === "success" || s.status === "error"
        );
        if (allDone) {
          onBranchCreated?.();
        }
      },
      onError: (error) => {
        setModelStatuses(prev => 
          prev.map(status => 
            status.model === model 
              ? { ...status, status: "error", error: error.message }
              : status
          )
        );
      },
    });
  });

  const isAnyLoading = branchingChats.some(chat => chat.isLoading);
  const hasAnyError = branchingChats.some(chat => chat.error);

  const handleMultiModelSubmit = async (data: MultiModelFormData) => {
    if (!data.message.trim() || isAnyLoading) return;

    // Initialize statuses
    setModelStatuses(
      data.selectedModels.map(model => ({
        model,
        status: "pending",
      }))
    );

    try {
      // Send message to all selected models simultaneously
      const promises = data.selectedModels.map(async (model, index) => {
        setModelStatuses(prev => 
          prev.map(status => 
            status.model === model 
              ? { ...status, status: "loading" }
              : status
          )
        );
        
        return branchingChats[index].sendMessage(data.message.trim());
      });

      await Promise.allSettled(promises);
      
      // Reset form after submission
      form.reset();
    } catch (error) {
      console.error("Error submitting multi-model branch:", error);
    }
  };

  if (isLoadingContext) {
    return (
      <Card className="border-t bg-background">
        <CardContent className="p-3 sm:p-4">
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
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 text-destructive">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{contextError.message}</span>
            </div>
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
      <CardContent className="p-3 sm:p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <h4 className="text-sm font-medium">Multi-Model Comparison</h4>
          </div>
          <Badge variant="outline" className="text-xs w-fit">
            From node: {parentNodeId.slice(0, 8)}...
          </Badge>
        </div>

        {/* Context Preview */}
        {context.length > 0 && (
          <div className="space-y-2">
            <FormLabel className="text-xs text-muted-foreground">
              Branching from:
            </FormLabel>
            <div className="bg-muted rounded-md p-2 max-h-20 overflow-y-auto">
              <div className="text-xs text-muted-foreground space-y-1">
                {context.slice(-1).map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    {msg.role === "user" ? (
                      <User className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Bot className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-xs leading-relaxed">
                      {msg.content.length > 60
                        ? msg.content.substring(0, 60) + "..."
                        : msg.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Multi-Model Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleMultiModelSubmit)}
            className="space-y-4"
          >
            {/* Branch Name */}
            <FormField
              control={form.control}
              name="branchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Model Comparison, Multi-AI Analysis..."
                      disabled={isAnyLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    This will be the parent name for all model responses
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Model Selection */}
            <FormField
              control={form.control}
              name="selectedModels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Models to Compare (2-4 models)</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COMPARISON_MODELS.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50"
                      >
                        <Checkbox
                          id={model.id}
                          checked={field.value.includes(model.id)}
                          onCheckedChange={(checked) => {
                            const currentSelection = field.value;
                            if (checked) {
                              if (currentSelection.length < 4) {
                                field.onChange([...currentSelection, model.id]);
                              }
                            } else {
                              field.onChange(
                                currentSelection.filter((m) => m !== model.id)
                              );
                            }
                          }}
                          disabled={
                            isAnyLoading ||
                            (!field.value.includes(model.id) && field.value.length >= 4)
                          }
                        />
                        <label
                          htmlFor={model.id}
                          className="flex-1 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="text-sm font-medium">{model.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              by {model.provider}
                            </span>
                          </div>
                          <Badge
                            variant={model.tier === "premium" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {model.tier}
                          </Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Model Status Display */}
            {modelStatuses.length > 0 && (
              <div className="space-y-2">
                <FormLabel className="text-xs text-muted-foreground">
                  Processing Status:
                </FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {modelStatuses.map((status) => (
                    <div
                      key={status.model}
                      className="flex items-center justify-between p-2 border rounded-md text-sm"
                    >
                      <span>{getModelDisplayName(status.model)}</span>
                      <div className="flex items-center gap-1">
                        {status.status === "pending" && (
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        )}
                        {status.status === "loading" && (
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                        {status.status === "success" && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                        {status.status === "error" && (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Message Input */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Input
                        placeholder="Ask the same question to all selected models..."
                        disabled={isAnyLoading}
                        className="flex-1"
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(handleMultiModelSubmit)();
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        {isAnyLoading ? (
                          <Button
                            type="button"
                            onClick={() => {
                              branchingChats.forEach(chat => chat.stop());
                            }}
                            variant="destructive"
                            className="flex-shrink-0"
                          >
                            <StopCircle className="h-4 w-4 mr-2" />
                            Stop All
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={
                              !form.watch("message")?.trim() ||
                              form.watch("selectedModels").length < 2
                            }
                            className="flex-shrink-0"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Compare
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          disabled={isAnyLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-muted-foreground text-center">
                             This will create separate branches for each selected model&apos;s response
            </p>
          </form>
        </Form>

        {/* Error Display */}
        {hasAnyError && (
          <div className="space-y-2">
            {branchingChats
              .filter(chat => chat.error)
              .map((chat, index) => (
                <div key={index} className="flex items-start space-x-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{chat.error?.message}</span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 