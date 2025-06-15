"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, LogIn, Eye, Heart } from "lucide-react";
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

// Demo conversations data
const DEMO_CONVERSATIONS = {
  "ai-comparison": {
    title: "AI Model Comparison Demo",
    description: "See how different AI models approach the same question",
    messageCount: 3,
  },
  "creative-writing": {
    title: "Creative Writing Exploration",
    description: "Explore different narrative styles and creative approaches",
    messageCount: 3,
  },
  "problem-solving": {
    title: "Complex Problem Solving",
    description: "Break down complex problems using multiple AI perspectives",
    messageCount: 3,
  },
};

interface DemoSelectionProps {
  onUpgrade: () => void;
}

export function DemoSelection({ onUpgrade }: DemoSelectionProps) {
  const [currentStep, setCurrentStep] = useState(0);

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

  return (
    <div className="flex flex-col bg-background py-20">
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
              <Link key={key} href={`/demo/${key}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 border-primary/10 hover:border-primary/30">
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
                        {demo.messageCount} messages
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Interactive Demo
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
