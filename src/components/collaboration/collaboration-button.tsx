"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Copy,
  Share2,
  Crown,
  Eye,
  Edit,
  MoreHorizontal,
  Activity,
  X,
  LogOut,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CollaborationButtonProps {
  chatId: string;
  chatTitle?: string;
  isCollaborative?: boolean;
  currentUserRole?: "owner" | "collaborator" | "viewer";
  className?: string;
  isRealtimeConnected?: boolean; // Add realtime connection status
}

interface CollaborationSession {
  id: string;
  chatId: string;
  activeSince: string;
  lastActivity: string;
  participantCount: number;
  isParticipant: boolean;
}

export function CollaborationButton({
  chatId,
  chatTitle = "Untitled Chat",
  currentUserRole = "owner",
  className,
  isRealtimeConnected = false,
}: CollaborationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"collaborator" | "viewer">(
    "collaborator"
  );
  const queryClient = useQueryClient();

  // Fetch current collaboration session
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["collaboration-session", chatId],
    queryFn: async (): Promise<CollaborationSession | null> => {
      try {
        const response = await fetch(`/api/collaboration/${chatId}`);

        // Handle different response statuses
        if (response.status === 404) {
          // No active session found - this is expected
          return null;
        }

        if (!response.ok) {
          // For network errors or other issues, throw to trigger retry
          const errorText = await response.text().catch(() => response.statusText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.session || null; // Ensure we return null instead of undefined
      } catch (error) {
        // Only log non-404 errors as they're unexpected
        if (error instanceof Error && !error.message.includes("404")) {
          console.error("Error fetching collaboration session:", error);
        }
        
        // For network errors (fetch failures), re-throw to trigger retry
        if (error instanceof TypeError && error.message.includes("fetch")) {
          throw error;
        }
        
        // For other errors, return null (no session)
        return null;
      }
    },
    refetchInterval: (data) => {
      // Only refetch if we have an active session, otherwise rely on realtime updates
      return data ? 30000 : false;
    },
    retry: (failureCount, error) => {
      // Retry on network errors but not on application errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return failureCount < 3;
      }
      return false;
    },
    // Don't show errors for expected 404s or network issues
    meta: {
      errorMessage: false,
    },
    // Add a stale time to prevent excessive refetching
    staleTime: 10000, // 10 seconds
    // Set a reasonable network retry interval
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Start collaboration session
  const startCollaboration = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/collaboration/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "owner" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start collaboration");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collaboration-session", chatId],
      });
      toast.success("Collaboration session started!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to start collaboration: ${error.message}`);
    },
  });

  // Leave collaboration session
  const leaveCollaboration = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("No active session");

      const response = await fetch(
        `/api/collaboration/${chatId}?sessionId=${session.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to leave collaboration");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collaboration-session", chatId],
      });
      toast.success("Left collaboration session");
    },
    onError: (error: Error) => {
      toast.error(`Failed to leave collaboration: ${error.message}`);
    },
  });

  // End collaboration session for all participants (owner only)
  const endCollaboration = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("No active session");

      const response = await fetch(`/api/collaboration/${chatId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to end collaboration session"
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collaboration-session", chatId],
      });
      toast.success("Collaboration session ended for all participants");
    },
    onError: (error: Error) => {
      toast.error(`Failed to end collaboration: ${error.message}`);
    },
  });

  // Copy collaboration link
  const copyCollaborationLink = useCallback(() => {
    const url = `${window.location.origin}/collaborate/${chatId}?collaborate=true`;
    navigator.clipboard.writeText(url);
    toast.success("Collaboration link copied to clipboard!");
  }, [chatId]);

  // Send invitation
  const sendInvitation = useCallback(async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      const response = await fetch("/api/collaboration/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          inviteeEmail: inviteEmail,
          role: inviteRole,
          chatTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send invitation");
      }

      toast.success(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send invitation";
      toast.error(errorMessage);
    }
  }, [chatId, inviteEmail, inviteRole, chatTitle]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "collaborator":
        return <Edit className="h-3 w-3" />;
      case "viewer":
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "collaborator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "viewer":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Button disabled size="sm" variant="outline" className={className}>
        <Activity className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  // Show error state only for unexpected errors (not network failures or 404s)
  if (error && !session && !(error instanceof TypeError)) {
    console.warn("Collaboration session error:", error);
    // For non-network errors, still show the start button but with warning
    return (
      <Button
        onClick={() => startCollaboration.mutate()}
        disabled={startCollaboration.isPending}
        size="sm"
        variant="outline"
        className={className}
        title="Unable to check collaboration status. You can still try to start collaboration."
      >
        <Users className="h-4 w-4 mr-2" />
        Start Collaboration
      </Button>
    );
  }

  return (
    <>
      {/* Main Collaboration Button */}
      {!session ? (
        <Button
          onClick={() => startCollaboration.mutate()}
          disabled={startCollaboration.isPending}
          size="sm"
          variant="outline"
          className={className}
        >
          <Users className="h-4 w-4 mr-2" />
          {startCollaboration.isPending ? "Starting..." : "Start Collaboration"}
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className={className}>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="flex items-center gap-1">
                  {session.participantCount}
                  {session.participantCount === 1 ? " user" : " users"}
                  {getRoleIcon(currentUserRole)}
                </span>
                {/* Realtime connection indicator */}
                {isRealtimeConnected ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-orange-500" />
                )}
                <MoreHorizontal className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">Collaboration Active</p>
              <p className="text-xs text-muted-foreground">
                {session.participantCount} participants
              </p>
              <div className="flex items-center justify-between mt-1">
                <Badge
                  variant="secondary"
                  className={`${getRoleColor(currentUserRole)}`}
                >
                  {getRoleIcon(currentUserRole)}
                  <span className="ml-1 capitalize">{currentUserRole}</span>
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {isRealtimeConnected ? (
                    <>
                      <Wifi className="h-3 w-3 text-green-500" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 text-orange-500" />
                      <span>Reconnecting...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyCollaborationLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Owner-only: End session for everyone */}
            {currentUserRole === "owner" && (
              <DropdownMenuItem
                onClick={() => endCollaboration.mutate()}
                disabled={endCollaboration.isPending}
                className="text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                {endCollaboration.isPending
                  ? "Ending..."
                  : "End Session for All"}
              </DropdownMenuItem>
            )}
            {/* Individual leave option */}
            <DropdownMenuItem
              onClick={() => leaveCollaboration.mutate()}
              disabled={leaveCollaboration.isPending}
              className={currentUserRole === "owner" ? "" : "text-destructive"}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {leaveCollaboration.isPending ? "Leaving..." : "Leave Session"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Invitation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to Collaboration</DialogTitle>
            <DialogDescription>
              Invite others to collaborate on &ldquo;{chatTitle}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendInvitation();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value: "collaborator" | "viewer") =>
                  setInviteRole(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaborator">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Collaborator</p>
                        <p className="text-xs text-muted-foreground">
                          Can edit and add content
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Viewer</p>
                        <p className="text-xs text-muted-foreground">
                          Can view but not edit
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={copyCollaborationLink}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={sendInvitation} className="flex-1">
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
