import { Metadata } from "next";
import { DemoModeChat } from "@/components/demo-mode-chat";
import { redirect, notFound } from "next/navigation";

// Define available demo scenarios
const DEMO_SCENARIOS = {
  "ai-comparison": {
    title: "AI Model Comparison Demo",
    description: "See how different AI models approach the same question",
    keywords: [
      "AI comparison",
      "GPT-4 vs Claude",
      "model comparison",
      "AI debate",
    ],
  },
  "creative-writing": {
    title: "Creative Writing with AI",
    description: "Explore different narrative styles and creative approaches",
    keywords: ["creative writing", "AI storytelling", "narrative branching"],
  },
  "problem-solving": {
    title: "Complex Problem Solving",
    description: "Break down complex problems using multiple AI perspectives",
    keywords: ["problem solving", "AI analysis", "multiple perspectives"],
  },
};

type Props = {
  params: Promise<{ scenario: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scenario } = await params;
  const scenarioData = DEMO_SCENARIOS[scenario as keyof typeof DEMO_SCENARIOS];

  if (!scenarioData) {
    return {
      title: "Demo Not Found | Zermind",
      description: "The requested demo scenario was not found.",
    };
  }

  return {
    title: `${scenarioData.title} | Zermind Demo`,
    description: `${scenarioData.description} - Experience Zermind's revolutionary AI mind mapping with this interactive demo. No signup required.`,
    keywords: [
      ...scenarioData.keywords,
      "AI demo",
      "mind mapping",
      "conversation visualization",
    ],
    openGraph: {
      title: `${scenarioData.title} - Zermind Demo`,
      description: scenarioData.description,
      type: "website",
      url: `/demo/${scenario}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${scenarioData.title} - Zermind Demo`,
      description: scenarioData.description,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(DEMO_SCENARIOS).map((scenario) => ({
    scenario,
  }));
}

export default async function DemoScenarioPage({ params }: Props) {
  const { scenario } = await params;

  // Check if scenario exists
  if (!(scenario in DEMO_SCENARIOS)) {
    notFound();
  }

  const handleUpgrade = () => {
    redirect("/auth/login");
  };

  return (
    <div className="w-full py-20">       
      <DemoModeChat onUpgrade={handleUpgrade} />
    </div>
  );
}
