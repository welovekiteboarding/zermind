import { DemoScenarioClient } from "./demo-scenario-client";
import { notFound } from "next/navigation";
import { DEMO_SCENARIOS } from "@/constants/demo-scenarios";

type Props = {
  params: Promise<{ scenario: string }>;
};

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

  return <DemoScenarioClient scenario={scenario} />;
}
