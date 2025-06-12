"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  MessageSquare,
  GitBranch,
  Zap,
  Users,
  Share,
  Bot,
  MessageSquarePlus,
  ArrowRight,
} from "lucide-react";
import { useCreateChat } from "@/hooks/use-chats-query";
import { useAuthUser } from "@/hooks/use-auth";

export default function ProtectedPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthUser();
  const createChatMutation = useCreateChat();

  const createNewChat = async () => {
    if (!user?.id) return;

    try {
      const newChat = await createChatMutation.mutateAsync({
        title: "New Chat",
      });

      // Navigate to the new chat
      router.push(`/protected/chat/${newChat.id}`);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Welcome to Zermind</h1>
          <p className="text-muted-foreground text-lg">
            Hello <span className="font-semibold">{user?.email}</span>
          </p>
          <p className="text-muted-foreground mt-2">
            The first AI chat platform with{" "}
            <span className="font-semibold text-purple-600">Mind Mode</span> -
            where conversations become visual mind maps.
          </p>
        </div>

        {/* Mode Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-blue-700 dark:text-blue-300">
                  Chat Mode
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  Default
                </Badge>
              </div>
              <CardDescription className="text-start">
                Traditional linear conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" />
                  Linear chat interface
                </li>
                <li className="flex items-center gap-2">
                  <Bot className="h-3 w-3" />
                  Multiple AI models
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Real-time streaming
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-purple-700 dark:text-purple-300">
                  Mind Mode
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700"
                >
                  New!
                </Badge>
              </div>
              <CardDescription className="text-start">
                Revolutionary conversation visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <GitBranch className="h-3 w-3" />
                  Branching conversations
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Resume from any node
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Multi-model debates
                </li>
                <li className="flex items-center gap-2">
                  <Share className="h-3 w-3" />
                  Shareable mind maps
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <MessageSquarePlus className="h-5 w-5" />
              Ready to get started?
            </CardTitle>
            <CardDescription className="text-base">
              Create your first chat and experience both Chat and Mind Mode interfaces.
              Switch between modes using the toggle in the sidebar anytime!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={createNewChat}
              size="lg"
              className="w-full sm:w-auto mx-auto flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={!user?.id || createChatMutation.isPending}
            >
              <MessageSquarePlus className="h-4 w-4" />
              {createChatMutation.isPending ? "Creating..." : "Start New Chat"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Your chat will be saved automatically and accessible from the sidebar
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
