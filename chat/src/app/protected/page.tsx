import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { AppHeader } from "@/components/app-header";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative">
      {/* App Header with Logo, Auth, and Theme */}
      <AppHeader showUserStatus={false} />
      
      {/* Main Content */}
      <div className="flex h-svh w-full items-center justify-center gap-2">
        <p>
          Hello <span className="font-semibold">{data.user.email}</span>
        </p>
        <LogoutButton />
      </div>
    </div>
  );
}
