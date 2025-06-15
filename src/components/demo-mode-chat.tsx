"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ChatConversation } from "@/components/chat-conversation";
import { MindMapView } from "@/components/mind-map/mind-map-view";
import { useChatModeStore } from "@/lib/store/chat-mode-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "./ui/progress";
import {
  Brain,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  LogIn,
  Eye,
  Heart,
} from "lucide-react";
import Link from "next/link";

// GitHub Icon Component
const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

// Demo message structure for pre-populated conversations

interface DemoModeChatProps {
  onUpgrade: () => void;
}

// Pre-populated demo conversations highlighting key features
const DEMO_CONVERSATIONS = {
  "ai-comparison": {
    title: "AI Model Comparison Demo",
    description: "See how different AI models approach the same question",
    messages: [
      {
        id: "demo-1",
        role: "user" as const,
        content: "What's the most exciting technology trend in 2025?",
        xPosition: 100,
        yPosition: 100,
        nodeType: "conversation" as const,
        isCollapsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-2",
        role: "assistant" as const,
        content:
          "AI agents are transforming how we work and interact with technology. From coding assistants to creative collaborators, AI is becoming deeply integrated into our daily workflows, making complex tasks more accessible and creative processes more innovative.",
        model: "openai/gpt-4o-mini",
        parentId: "demo-1",
        xPosition: 300,
        yPosition: 50,
        nodeType: "conversation" as const,
        isCollapsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-3",
        role: "assistant" as const,
        content:
          "Quantum computing is reaching practical applications in 2025. With major breakthroughs in error correction and increased qubit stability, we're seeing real-world applications in cryptography, drug discovery, and complex optimization problems.",
        model: "anthropic/claude-3-sonnet",
        parentId: "demo-1",
        branchName: "Claude's Perspective",
        xPosition: 300,
        yPosition: 150,
        nodeType: "branching_point" as const,
        isCollapsed: false,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  "creative-writing": {
    title: "Creative Writing Exploration",
    description: "Explore different narrative styles and creative approaches",
    messages: [
      {
        id: "demo-4",
        role: "user" as const,
        content:
          "Help me write a short story about a robot discovering emotions",
        xPosition: 100,
        yPosition: 100,
        nodeType: "conversation" as const,
        isCollapsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-5",
        role: "assistant" as const,
        content:
          "**The First Tear**\n\nUnit-47 stood in the abandoned library, its optical sensors scanning the dust-covered books. For the first time in its existence, it felt something beyond its programming—a longing for the stories it could never truly understand. When a photograph fell from an old book, showing a family laughing together, Unit-47 experienced what humans called sadness. A single drop of condensation formed on its face plate, and it understood: it was crying.",
        model: "openai/gpt-4o-mini",
        parentId: "demo-4",
        branchName: "Emotional Narrative",
        xPosition: 350,
        yPosition: 50,
        nodeType: "conversation" as const,
        isCollapsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-6",
        role: "user" as const,
        content: "That's beautiful! Can you explore what happens next?",
        parentId: "demo-5",
        xPosition: 600,
        yPosition: 50,
        nodeType: "conversation" as const,
        isCollapsed: false,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  "problem-solving": {
    title: "Complex Problem Solving",
    description: "Break down complex problems using multiple AI perspectives",
    messages: [
      {
        id: "demo-7",
        role: "user" as const,
        content:
          "How can cities reduce traffic congestion while improving air quality?",
        xPosition: 100,
        yPosition: 100,
        nodeType: "conversation" as const,
        isCollapsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-8",
        role: "assistant" as const,
        content:
          "**Smart Infrastructure Approach:**\n\n1. **Dynamic Traffic Management**: AI-powered traffic lights that adapt in real-time\n2. **Public Transit Integration**: Seamless multimodal transportation apps\n3. **Electric Vehicle Incentives**: Charging infrastructure + tax benefits\n4. **Congestion Pricing**: Peak hour fees for city center access\n5. **Remote Work Policies**: Reduce commuting demand through flexible work",
        model: "anthropic/claude-3-sonnet",
        parentId: "demo-7",
        branchName: "Infrastructure Focus",
        xPosition: 350,
        yPosition: 50,
        nodeType: "insight" as const,
        isCollapsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-9",
        role: "assistant" as const,
        content:
          "**Sustainable Transportation Revolution:**\n\n• **Micro-mobility**: E-scooters, bikes, and walking paths\n• **Autonomous Shuttles**: Shared, electric, and efficient\n• **15-minute Cities**: Everything within walking/cycling distance\n• **Green Corridors**: Tree-lined paths that absorb emissions\n• **Community Incentives**: Gamification of sustainable transport choices",
        model: "meta/llama-3.1-70b-instruct",
        parentId: "demo-7",
        branchName: "Sustainability Focus",
        xPosition: 350,
        yPosition: 200,
        nodeType: "insight" as const,
        isCollapsed: false,
        createdAt: new Date().toISOString(),
      },
    ],
  },
};

export function DemoModeChat({ onUpgrade }: DemoModeChatProps) {
  const { mode } = useChatModeStore();
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [userMessages, setUserMessages] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const MAX_DEMO_MESSAGES = 5;
  const isLimitReached = userMessages >= MAX_DEMO_MESSAGES;

  // Demo progression steps
  const demoSteps = [
    "Welcome to Zermind! 👋",
    "Try our pre-built demos below",
    "Switch between Chat and Mind Mode",
    "See how AI models compare",
    "Ready to unlock full features?",
  ];

  useEffect(() => {
    // Auto-advance demo steps
    if (currentStep < demoSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, demoSteps.length]);

  const handleDemoSelect = useCallback((demoKey: string) => {
    setSelectedDemo(demoKey);
  }, []);

  const handleBackToSelection = useCallback(() => {
    setSelectedDemo(null);
  }, []);

  const handleMessageAttempt = useCallback(() => {
    if (isLimitReached) {
      setShowUpgradeModal(true);
      return false;
    }
    setUserMessages((prev) => prev + 1);
    return true;
  }, [isLimitReached]);

  if (!selectedDemo) {
    return (
      <div className="flex flex-col bg-background py-20 h-full">
        {/* Demo Progress */}
        <div className="px-4 py-3 border-b border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Demo Progress</span>
            <span className="font-medium">
              {currentStep + 1} / {demoSteps.length}
            </span>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            >
              <Eye className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          </div>
          <Progress
            value={((currentStep + 1) / demoSteps.length) * 100}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {demoSteps[currentStep]}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Demo Conversations */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Interactive Demos</h2>
              <p className="text-muted-foreground text-sm">
                Experience both Chat and Mind modes with pre-built conversations
              </p>
            </div>

            <div className="grid gap-4">
              {Object.entries(DEMO_CONVERSATIONS).map(([key, demo]) => (
                <Card
                  key={key}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 border-primary/10 hover:border-primary/30"
                  onClick={() => handleDemoSelect(key)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{demo.title}</CardTitle>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {demo.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {demo.messages.length} messages
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Interactive Demo
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upgrade CTA */}
          <Card className="border-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                Ready for the Full Experience?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Sign in to unlock unlimited conversations, real-time
                collaboration, and advanced features
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={onUpgrade}
                  className="bg-primary hover:bg-primary/80"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In to Continue
                </Button>
                <Button variant="outline" asChild>
                  <Link
                    href="https://github.com/okikeSolutions/zermind"
                    target="_blank"
                  >
                    View Source Code
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm text-muted-foreground space-y-2 sm:space-y-3">
            <p>
              Open source • Privacy-focused • Built for{" "}
              <Link
                href="https://cloneathon.t3.chat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline"
              >
                Cloneathon 2025
              </Link>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <Link
                href="/privacy"
                className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline"
              >
                Terms of Use
              </Link>
              <span>•</span>
              <Link
                href="/imprint"
                className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline"
              >
                Imprint
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <Link
                href="https://github.com/okikeSolutions/zermind"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline inline-flex items-center gap-1"
              >
                <GitHubIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                GitHub Repo
              </Link>
              <span>•</span>
              <Link
                href="https://github.com/sponsors/okikeSolutions"
                className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline inline-flex items-center gap-1"
              >
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-primary" />
                Support Zermind
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render selected demo conversation
  const demoData =
    DEMO_CONVERSATIONS[selectedDemo as keyof typeof DEMO_CONVERSATIONS];
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
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Mind Mode Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
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
        <div className="flex-1 overflow-hidden relative">
          <MindMapView
            messages={mindMapMessages}
            onResumeConversation={() => {
              if (!handleMessageAttempt()) return;
              // Demo: simulate resume functionality
              console.log("Demo: Resume conversation");
            }}
            onCreateBranch={() => {
              if (!handleMessageAttempt()) return;
              // Demo: simulate branch creation
              console.log("Demo: Create branch");
            }}
            onCreateMultiModelBranch={() => {
              if (!handleMessageAttempt()) return;
              // Demo: simulate multi-model branch
              console.log("Demo: Create multi-model branch");
            }}
          />

          {/* Demo Overlay */}
          <div className="absolute top-4 left-4 right-4 pointer-events-none">
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
    );
  }

  // Traditional Chat Mode
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Chat Mode Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToSelection}
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
          isSharedView={true} // Treat as read-only-ish
        />
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Demo Limit Reached</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
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
  );
}
