import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZermindLogoProps {
  variant?: "default" | "compact";
  className?: string;
}

export function ZermindLogo({ variant = "default", className = "" }: ZermindLogoProps) {
  if (variant === "compact") {
    return (
      <Button asChild variant="ghost" size="sm" className={`hover:bg-transparent ${className}`}>
        <Link href="/" className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg bg-primary bg-clip-text text-transparent">
            Zermind
          </span>
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="ghost" className={`hover:bg-transparent ${className}`}>
      <Link href="/" className="flex items-center space-x-2">
        <div className="relative">
          <Sparkles className="h-8 w-8 text-primary/60" />
        </div>
        <span className="font-bold text-2xl bg-primary bg-clip-text text-transparent">
          Zermind
        </span>
      </Link>
    </Button>
  );
} 