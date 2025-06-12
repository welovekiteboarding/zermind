"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Sparkles,
  Zap,
  GitBranch,
  Network,
  Users,
  Share2,
  Map,
  Eye,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { FAQItem } from "@/components/faq-item";

interface ChatInterfaceProps {
  user: SupabaseUser | null;
}

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

export function ChatInterface({ user }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleStartChat = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!message.trim()) return;

    try {
      // TODO: Create a new chat and navigate to it
      // For now, redirect to the protected route (will become chat interface)
      router.push("/protected");
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const modelProviders = [
    {
      name: "GPT-4",
      provider: "OpenAI",
      color: "bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900",
    },
    {
      name: "Claude 3",
      provider: "Anthropic",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    {
      name: "Llama 3.1",
      provider: "Meta",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
  ];

  return (
    <div className="w-full max-w-4xl space-y-8 py-32">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-4xl font-bold bg-primary bg-clip-text text-transparent">
            Zermind
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Your open-source AI chat companion
        </p>
        {!user && (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2 border">
            Sign in to start chatting with AI models
          </p>
        )}
      </div>

      {/* Main Chat Card */}
      <Card className="border-2 border-primary/10 shadow-xl backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center space-x-2">
            <span>Start Chatting</span>
          </CardTitle>
          <CardDescription>
            {user
              ? "Choose from multiple AI models and start your conversation"
              : "Sign in to access multiple AI models and start chatting"}
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
                <Badge
                  key={index}
                  variant="secondary"
                  className={`${model.color} ${
                    user
                      ? "hover:scale-105 cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                  } transition-transform`}
                >
                  {model.name}
                  <span className="ml-1 text-xs opacity-70">
                    by {model.provider}
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder={
                  user
                    ? "What would you like to chat about today?"
                    : "Sign in to start chatting..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!user}
                className="pr-12 h-12 text-base border-2 border-primary/20 focus:border-primary/40 transition-colors disabled:opacity-60"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (message.trim() || !user)) {
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
              disabled={!!user && !message.trim()}
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {!user ? "Sign In to Start Chatting" : "Start Conversation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Features */}
      <div className="space-y-8 py-16">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Revolutionary AI Interaction</h2>
          <p className="text-muted-foreground text-lg">
            The first platform to transform AI conversations into visual mind
            maps
          </p>
        </div>

        {/* Core Innovation Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2 gap-6">
          <Card className="border-2 border-primary/10 shadow-xl backdrop-blur-sm col-span-2">
            <CardContent className="p-6 text-center space-y-3">
              <div className="relative">
                <Map className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="font-bold text-lg">Mind Mode</h3>
              <p className="text-sm text-muted-foreground">
                Transform conversations into interactive mind maps. Visualize
                how ideas connect and evolve in real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 shadow-xl backdrop-blur-sm col-span-2">
            <CardContent className="p-6 text-center space-y-3">
              <div className="relative">
                <GitBranch className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="font-bold text-lg">Multi-Model Branching</h3>
              <p className="text-sm text-muted-foreground">
                Ask the same question to different AI models and see their
                responses branch visually. Compare approaches side-by-side.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 shadow-xl backdrop-blur-sm col-span-2">
            <CardContent className="p-6 text-center space-y-3">
              <div className="relative">
                <RefreshCw className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="font-bold text-lg">Resumable Conversations</h3>
              <p className="text-sm text-muted-foreground">
                Click any node in your conversation tree to continue from that
                exact point. Never lose context again.
              </p>
            </CardContent>
          </Card>

          {/* <Card className="border-2 border-primary/10 shadow-xl backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-3">
              <div className="relative">
                <MessageSquareMore className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="font-bold text-lg">Dual-Mode Interface</h3>
              <p className="text-sm text-muted-foreground">
                Seamlessly switch between traditional chat and revolutionary
                mind map mode with a single click.
              </p>
            </CardContent>
          </Card> */}

          <Card className="border-2 border-primary/10 shadow-xl backdrop-blur-sm col-span-3">
            <CardHeader className="text-center">
              <Badge variant="secondary" className="text-sm">
                Soon
              </Badge>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-3">
              <div className="relative">
                <Users className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="font-bold text-lg">Real-time Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Collaborate with your team in real-time. Build mind maps
                together and explore ideas collectively.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 shadow-xl backdrop-blur-sm col-span-3">
            <CardHeader className="text-center">
              <Badge variant="secondary" className="text-sm">
                Soon
              </Badge>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-3">
              <div className="relative">
                <Share2 className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="font-bold text-lg">Shareable Mind Maps</h3>
              <p className="text-sm text-muted-foreground">
                Share your conversation trees as interactive mind maps. Perfect
                for presentations and knowledge sharing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Zermind */}
        <Card className="border-2 border-primary/10 shadow-xl backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center space-x-2">
              <span>Why Choose Zermind?</span>
            </CardTitle>
            <CardDescription className="text-base">
              The first platform to revolutionize AI interaction through visual
              conversation trees
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/20 rounded-full p-2 mt-0.5">
                  <GitBranch className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Category-Defining Innovation</h4>
                  <p className="text-sm text-muted-foreground">
                    We don&apos;t just clone ChatGPT - we redefine how humans
                    interact with AI through visual conversation mapping.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/20 rounded-full p-2 mt-0.5">
                  <Network className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Multi-Model Intelligence</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare responses from GPT-4, Claude, Llama, and more in the
                    same conversation tree.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/20 rounded-full p-2 mt-0.5">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Visual Thinking</h4>
                  <p className="text-sm text-muted-foreground">
                    See how ideas connect, evolve, and branch. Perfect for
                    research, brainstorming, and complex problem-solving.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/20 rounded-full p-2 mt-0.5">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Open Source & Privacy-First</h4>
                  <p className="text-sm text-muted-foreground">
                    Fully open source with your privacy in mind. Use your own
                    API keys and maintain control of your data.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="space-y-6 py-16">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about Zermind
            </p>
          </div>

          <div className="space-y-4 w-full mx-auto">
            <FAQItem
              question="What makes Zermind different from other AI chat tools?"
              answer="Zermind is the first platform to transform AI conversations into interactive mind maps. Instead of linear chat, you can visualize how ideas branch, compare different AI models side-by-side, and resume conversations from any point in the tree. It's visual thinking meets AI conversation."
            />

            <FAQItem
              question="How does Mind Mode work?"
              answer="Mind Mode converts your conversations into visual node-based trees. Each message becomes a node, and you can branch conversations by asking different questions or using different AI models. You can click any node to continue that conversation thread, creating a rich, explorable knowledge structure."
            />

            <FAQItem
              question="Can I use my own API keys?"
              answer="Yes! Zermind supports bring-your-own-key (BYOK) through OpenRouter, giving you access to multiple AI models while maintaining control over your usage and costs. We also support direct integrations with major providers."
            />

            <FAQItem
              question="Is Zermind free to use?"
              answer="Zermind is open source and free to use. You only pay for the AI model usage through your own API keys. We believe in keeping AI conversation tools accessible to everyone while respecting privacy and user control."
            />

            <FAQItem
              question="Can I collaborate with others on mind maps?"
              answer="Yes! Zermind supports real-time collaboration, allowing multiple users to work on the same conversation tree simultaneously. Perfect for team brainstorming, research projects, and collaborative problem-solving."
            />

            <FAQItem
              question="How do I share my conversation trees?"
              answer="You can share your mind maps as interactive public links that others can explore and branch from. You can also export them as images or interactive HTML files for presentations and documentation."
            />

            <FAQItem
              question="Is my data private and secure?"
              answer="Absolutely. Your conversations are stored securely, and you control your data. When using your own API keys, your conversations go directly to the AI providers. We're open source, so you can verify our privacy practices yourself."
            />

            <FAQItem
              question="Which AI models are supported?"
              answer="Zermind supports all major AI models including GPT-4, Claude 3, Llama 3.1, and many more through OpenRouter integration. You can use different models within the same conversation tree for diverse perspectives."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
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
        <p className="mt-2">
          <Link
            href="/privacy"
            className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline"
          >
            Privacy Policy
          </Link>
          {" • "}
          <Link
            href="/terms"
            className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline"
          >
            Terms of Use
          </Link>
          {" • "}
          <Link
            href="/imprint"
            className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline"
          >
            Imprint
          </Link>
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-1">
          <Link
            href="https://github.com/okikeSolutions/zermind"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline inline-flex items-center gap-1"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub Repo
          </Link>
          {" • "}
          <Link
            href="https://github.com/sponsors/okikeSolutions"
            className="text-primary font-bold hover:text-primary/80 transition-colors hover:underline inline-flex items-center gap-1"
          >
            <Heart className="h-4 w-4 fill-primary" />
            Support Zermind
          </Link>
        </p>
      </div>
    </div>
  );
}
