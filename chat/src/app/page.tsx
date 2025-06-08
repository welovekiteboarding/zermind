"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Brain, MessageCircle, Sparkles, Zap } from "lucide-react";

export default function Home() {
  const [message, setMessage] = useState("");

  const handleStartChat = () => {
    // TODO: Implement chat navigation
    console.log("Starting chat with:", message);
  };

  const modelProviders = [
    { name: "GPT-4", provider: "OpenAI", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
    { name: "Claude 3", provider: "Anthropic", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    { name: "Mistral", provider: "Mistral AI", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>
      
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-primary/60" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Zermind
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your open-source AI chat companion
          </p>
        </div>

        {/* Main Chat Card */}
        <Card className="border-2 border-primary/10 shadow-xl backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>Start Chatting</span>
            </CardTitle>
            <CardDescription>
              Choose from multiple AI models and start your conversation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Available Models */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Available Models</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {modelProviders.map((model, index) => (
                  <Badge key={index} variant="secondary" className={`${model.color} hover:scale-105 transition-transform cursor-pointer`}>
                    {model.name}
                    <span className="ml-1 text-xs opacity-70">by {model.provider}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="What would you like to chat about today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="pr-12 h-12 text-base border-2 border-primary/20 focus:border-primary/40 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && message.trim()) {
                      handleStartChat();
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              <Button 
                onClick={handleStartChat}
                disabled={!message.trim()}
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Conversation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-sm">Multi-Model Support</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Chat with various AI models
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-sm">Synced History</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Access your chats anywhere
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-sm">Real-time Streaming</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Fast, responsive conversations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Open source • Privacy-focused • Built for{" "}
            <a 
              href="https://cloneathon.t3.chat" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Cloneathon 2025
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
