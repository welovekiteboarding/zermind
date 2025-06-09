import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { ChatInterface } from "@/components/chat-interface";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      {/* App Header with Logo, Auth, and Theme */}
      <AppHeader />
      
      {/* Main Content */}
      <ChatInterface user={user} />
    </div>
  );
}
