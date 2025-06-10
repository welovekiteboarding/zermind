import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type PublicApiKey,
  type CreateApiKey,
  type UpdateApiKey,
  type Provider,
} from "@/lib/schemas/api-keys";

// Query keys
export const apiKeysKeys = {
  all: ["api-keys"] as const,
  lists: () => [...apiKeysKeys.all, "list"] as const,
  list: () => [...apiKeysKeys.lists()] as const,
};

// Fetch user's API keys
export function useApiKeys() {
  return useQuery({
    queryKey: apiKeysKeys.list(),
    queryFn: async (): Promise<PublicApiKey[]> => {
      const response = await fetch("/api/user/api-keys");
      if (!response.ok) {
        throw new Error("Failed to fetch API keys");
      }
      const data = await response.json();
      return data.apiKeys;
    },
  });
}

// Create API key mutation
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApiKey): Promise<PublicApiKey> => {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create API key");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.list() });
    },
  });
}

// Update API key mutation
export function useUpdateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      keyId,
      data,
    }: {
      keyId: string;
      data: UpdateApiKey;
    }): Promise<PublicApiKey> => {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update API key");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.list() });
    },
  });
}

// Delete API key mutation
export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string): Promise<void> => {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete API key");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.list() });
    },
  });
}

// Check if user has an active API key for a specific provider
export function useHasApiKey(provider: Provider) {
  const { data: apiKeys = [] } = useApiKeys();

  return apiKeys.some((key) => key.provider === provider && key.isActive);
}
