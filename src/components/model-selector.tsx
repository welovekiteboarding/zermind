"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

// Popular OpenRouter models
const MODELS = [
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Best for reasoning, analysis, and coding",
    tier: "premium",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic", 
    description: "Fast and efficient for simple tasks",
    tier: "standard",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Latest multimodal model from OpenAI",
    tier: "premium",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Faster and cheaper version of GPT-4o",
    tier: "standard",
  },
  {
    id: "meta-llama/llama-3.1-405b-instruct",
    name: "Llama 3.1 405B",
    provider: "Meta",
    description: "Open source, great for general tasks",
    tier: "premium",
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    provider: "Meta",
    description: "Balanced performance and speed",
    tier: "standard",
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  disabled = false,
  className 
}: ModelSelectorProps) {
  const currentModel = MODELS.find(model => model.id === selectedModel) || MODELS[0];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "standard":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className={cn("justify-between min-w-[200px]", className)}
        >
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4" />
            <span className="truncate">{currentModel.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>Select AI Model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Group by provider */}
        {["Anthropic", "OpenAI", "Meta", "Google"].map((provider) => {
          const providerModels = MODELS.filter(model => model.provider === provider);
          if (providerModels.length === 0) return null;
          
          return (
            <div key={provider}>
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                {provider}
              </DropdownMenuLabel>
              {providerModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onModelChange(model.id)}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer",
                    selectedModel === model.id && "bg-accent"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{model.name}</span>
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getTierColor(model.tier))}
                    >
                      {model.tier}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {model.description}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          );
        })}
        
        <div className="px-2 py-1">
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <a 
              href="https://openrouter.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              OpenRouter
            </a>
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 