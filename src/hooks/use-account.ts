import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { 
  DeleteAccount, 
  DeleteAccountResponse, 
  AccountErrorResponse 
} from "@/lib/schemas/account";

// Query keys for account operations
export const accountKeys = {
  all: ['account'] as const,
  stats: () => [...accountKeys.all, 'stats'] as const,
};

// Hook to get user account statistics (for showing what will be deleted)
export function useAccountStats() {
  return useQuery({
    queryKey: accountKeys.stats(),
    queryFn: async () => {
      const response = await fetch("/api/user/account/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch account statistics");
      }
      return response.json();
    },
  });
}

// Hook to export user data
export function useExportData() {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch("/api/user/account/export");
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export data");
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1] || "data-export.json";
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

// Hook to delete user account
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteAccount): Promise<DeleteAccountResponse> => {
      const response = await fetch("/api/user/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const error = result as AccountErrorResponse;
        throw new Error(error.error || "Failed to delete account");
      }

      return result as DeleteAccountResponse;
    },
    onSuccess: async () => {
      // Clear all queries since the user account is being deleted
      queryClient.clear();
      
      // Sign out the user (this should already be done by the API, but let's be safe)
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error signing out after account deletion:", error);
      }

      // Redirect to home page after successful deletion
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
  });
} 