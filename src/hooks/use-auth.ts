import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AuthData {
  user: User | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  return useQuery<AuthData, Error>({
    queryKey: ["auth", "user"],
    queryFn: async (): Promise<AuthData> => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Auth error:", error);
          return { user: null, isAuthenticated: false };
        }

        return {
          user: data.user,
          isAuthenticated: !!data.user,
        };
      } catch (error) {
        console.error("Error getting user:", error);
        return { user: null, isAuthenticated: false };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useAuthUser() {
  const { data, isLoading, error } = useAuth();

  return {
    user: data?.user || null,
    isAuthenticated: data?.isAuthenticated || false,
    isLoading,
    error,
  };
}
