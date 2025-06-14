import { ZermindLogo } from "./zermind-logo";
import { AuthButton } from "./auth/auth-button";
import { ThemeSwitcher } from "./theme-switcher";

export async function AppHeader() {
  return (
    <>
      {/* Logo in top left */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-1.5 sm:p-2">
          <ZermindLogo variant="compact" />
        </div>
      </div>

      {/* Auth and Theme controls in top right */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 flex items-center gap-2 sm:gap-3">
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-1.5 sm:p-2">
          <AuthButton />
        </div>
        <ThemeSwitcher />
      </div>
    </>
  );
}
