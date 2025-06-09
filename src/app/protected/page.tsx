import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/server";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-background via-background to-muted/30">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4">
            <SidebarTrigger className="mb-4" />
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-semibold mb-8">
                  Welcome to Zermind
                </h1>
                <p className="text-muted-foreground">
                  Hello <span className="font-semibold">{data.user.email}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create a new chat to get started or select an existing one from the sidebar.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
