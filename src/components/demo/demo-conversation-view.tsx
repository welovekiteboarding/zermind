"use client";

import { useState, useCallback } from "react";
import { ChatConversation } from "@/components/chat-conversation";
import { MindMapView } from "@/components/mind-map/mind-map-view";
import { useChatModeStore } from "@/lib/store/chat-mode-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  MessageSquare,
  ArrowLeft,
  Lightbulb,
  LogIn,
} from "lucide-react";
import { DEMO_CONVERSATIONS } from "./demo-conversation-data";
import { Switch } from "../ui/switch";

interface DemoConversationViewProps {
  scenario: string;
  onUpgrade: () => void;
  onBack: () => void;
}

export function DemoConversationView({
  scenario,
  onUpgrade,
  onBack,
}: DemoConversationViewProps) {
  const { mode, setMode } = useChatModeStore();
  const [userMessages, setUserMessages] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isMindMode = mode === "mind";

  const MAX_DEMO_MESSAGES = 5;
  const isLimitReached = userMessages >= MAX_DEMO_MESSAGES;

  const demoData =
    DEMO_CONVERSATIONS[scenario as keyof typeof DEMO_CONVERSATIONS];

  const handleMessageAttempt = useCallback(() => {
    if (isLimitReached) {
      setShowUpgradeModal(true);
      return false;
    }
    setUserMessages((prev) => prev + 1);
    return true;
  }, [isLimitReached]);

  if (!demoData) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Demo Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested demo scenario could not be found.
          </p>
          <Button onClick={onBack}>Back to Demo Selection</Button>
        </div>
      </div>
    );
  }

  // Prepare messages for different views
  const mindMapMessages = demoData.messages.map((msg, index) => ({
    ...msg,
    xPosition: msg.xPosition || (index % 3) * 400,
    yPosition: msg.yPosition || Math.floor(index / 3) * 250,
    attachments: [],
  }));

  const conversationMessages = demoData.messages.map((msg) => ({
    ...msg,
    createdAt: new Date(msg.createdAt),
    attachments: [],
    xPosition: msg.xPosition || 0,
    yPosition: msg.yPosition || 0,
    nodeType: msg.nodeType || ("conversation" as const),
    isCollapsed: msg.isCollapsed || false,
    isLocked: false,
    editedAt: undefined,
  }));

  if (mode === "mind") {
    return (
      <div className="py-20">
        <div className="flex flex-col w-full h-full">
          {/* Mind Mode Header */}
          <div className="border-b border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Brain className="h-5 w-5 text-purple-500" />
                <div>
                  <h2 className="font-semibold">{demoData.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    Mind Mode Demo - {demoData.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                    <MessageSquare className="h-3 w-3" />
                    <span>Chat</span>
                  </div>
                  <Switch
                    checked={isMindMode}
                    onCheckedChange={(checked) =>
                      setMode(checked ? "mind" : "chat")
                    }
                    className="data-[state=checked]:bg-purple-500"
                  />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                    <Brain className="h-3 w-3" />
                    <span>Mind</span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Mind Mode
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Demo
                </Badge>
              </div>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="px-4 py-2 border-b bg-muted/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Demo Messages Used</span>
              <span
                className={`font-medium ${
                  isLimitReached ? "text-destructive" : ""
                }`}
              >
                {userMessages} / {MAX_DEMO_MESSAGES}
              </span>
            </div>
            <Progress
              value={(userMessages / MAX_DEMO_MESSAGES) * 100}
              className={`mt-1 ${isLimitReached ? "bg-destructive/20" : ""}`}
            />
          </div>

          {/* Mind Map View */}
          <div className="flex-1 overflow-hidden w-full h-full">
            <MindMapView
              messages={mindMapMessages}
              onResumeConversation={() => {
                if (!handleMessageAttempt()) return;
                console.log("Demo: Resume conversation");
              }}
              onCreateBranch={() => {
                if (!handleMessageAttempt()) return;
                console.log("Demo: Create branch");
              }}
              onCreateMultiModelBranch={() => {
                if (!handleMessageAttempt()) return;
                console.log("Demo: Create multi-model branch");
              }}
            />

            {/* Demo Overlay */}
            <div className="absolute bottom-2 left-4 right-4 pointer-events-none">
              <Card className="bg-background/95 backdrop-blur border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Mind Mode Demo:</span>
                    <span className="text-muted-foreground">
                      See how conversations become visual mind maps
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Traditional Chat Mode
  return (
    <div className="py-20">
      <div className="flex flex-col w-full h-full">
        {/* Chat Mode Header */}
        <div className="border-b border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <h2 className="font-semibold">{demoData.title}</h2>
                <p className="text-xs text-muted-foreground">
                  Chat Mode Demo - {demoData.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                  <MessageSquare className="h-3 w-3" />
                  <span>Chat</span>
                </div>
                <Switch
                  checked={isMindMode}
                  onCheckedChange={(checked) =>
                    setMode(checked ? "mind" : "chat")
                  }
                  className="data-[state=checked]:bg-purple-500"
                />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                  <Brain className="h-3 w-3" />
                  <span>Mind</span>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Chat Mode
              </Badge>
              <Badge variant="outline" className="text-xs">
                Demo
              </Badge>
            </div>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Demo Messages Used</span>
            <span
              className={`font-medium ${
                isLimitReached ? "text-destructive" : ""
              }`}
            >
              {userMessages} / {MAX_DEMO_MESSAGES}
            </span>
          </div>
          <Progress
            value={(userMessages / MAX_DEMO_MESSAGES) * 100}
            className={`mt-1 ${isLimitReached ? "bg-destructive/20" : ""}`}
          />
        </div>

        {/* Traditional Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatConversation
            chatId="demo-chat"
            initialMessages={conversationMessages}
            userId="demo-user"
            chatTitle={demoData.title}
            isSharedView={true}
          />
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 text-center space-y-4">
                <h3 className="text-xl font-semibold">Demo Limit Reached</h3>
                <p className="text-muted-foreground">
                  You&apos;ve reached the 5-message demo limit. Sign in to
                  continue with unlimited conversations!
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={onUpgrade}
                    className="w-full bg-primary hover:bg-primary/80"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In to Continue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-full"
                  >
                    Back to Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
