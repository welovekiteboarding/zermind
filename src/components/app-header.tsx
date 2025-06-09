import { createClient } from "@/lib/supabase/server";
import { ZermindLogo } from "./zermind-logo";
import { AuthButton } from "./auth/auth-button";
import { ThemeSwitcher } from "./theme-switcher";
import { User } from "lucide-react";

interface AppHeaderProps {
  showUserStatus?: boolean;
}

export async function AppHeader({ showUserStatus = true }: AppHeaderProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      {/* Logo in top left */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-2">
          <ZermindLogo variant="compact" />
        </div>
      </div>

      {/* User Status - only show if user is authenticated and showUserStatus is true */}
      {showUserStatus && user && (
        <div className="absolute top-4 left-44 z-10">
          <div className="bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-2 flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {user.email?.split('@')[0]}
            </span>
          </div>
        </div>
      )}

      {/* Auth and Theme controls in top right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-2">
          <AuthButton />
        </div>
        <ThemeSwitcher />
      </div>
    </>
  );
} 