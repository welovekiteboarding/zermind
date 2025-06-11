import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      redirect("/login");
    }

    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Welcome to Zermind</h1>
            <p className="text-muted-foreground text-lg">
              Hello <span className="font-semibold">{data.user.email}</span>
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

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Switch between modes using the toggle in the sidebar. Create a new
              chat to experience both interfaces!
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Authentication error:", error);
    redirect("/login");
  }
}
