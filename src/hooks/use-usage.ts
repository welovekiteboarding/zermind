import { useQuery } from "@tanstack/react-query";
import { type UsageStats } from "@/lib/schemas/usage";

export function useUsageStats() {
  return useQuery<UsageStats, Error>({
    queryKey: ["usage", "stats"],
    queryFn: async (): Promise<UsageStats> => {
      const response = await fetch("/api/usage");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch usage statistics: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - usage stats don't change frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}
