import { AppHeader } from "@/components/app-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try Zermind Demo - Experience AI Mind Mapping",
  description:
    "Experience the future of AI conversation with Zermind's interactive demo. Transform chats into visual mind maps, compare AI models, and explore revolutionary conversation branching - no signup required.",
  keywords: [
    "AI demo",
    "mind mapping",
    "conversation visualization",
    "AI chat demo",
    "GPT-4 vs Claude",
    "interactive AI",
    "visual thinking",
    "AI comparison",
  ],
  openGraph: {
    title: "Try Zermind Demo - Revolutionary AI Mind Mapping",
    description:
      "The first AI platform that transforms conversations into visual mind maps. Try our interactive demo featuring multi-model AI comparison and conversation branching.",
    type: "website",
    url: "/demo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Try Zermind Demo - AI Mind Mapping Revolution",
    description:
      "Experience visual AI conversations with mind maps, multi-model comparison, and conversation branching. No signup required!",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/demo",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden bg-background">
      <AppHeader /> 
      {children}
    </div>
  );
}
