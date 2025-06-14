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
  X,
  LogOut,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

interface CollaborationButtonProps {
  chatId: string;
  chatTitle?: string;
  isCollaborative?: boolean;
  currentUserRole?: "owner" | "collaborator" | "viewer";
  className?: string;
  isRealtimeConnected?: boolean;
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
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const queryClient = useQueryClient();

  // Only fetch session if we think there might be one active
  // This prevents the premature API calls that cause the button to get stuck
  const {
    data: session,
    isLoading,
  } = useQuery({
    queryKey: ["collaboration-session", chatId],
    queryFn: async (): Promise<CollaborationSession | null> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Shorter timeout

      try {
        const response = await fetch(`/api/collaboration/${chatId}`, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        clearTimeout(timeoutId);

        if (response.status === 404) {
          // No session found - update our state
          setHasActiveSession(false);
          return null;
        }

        if (!response.ok) {
          console.warn(`Collaboration API returned ${response.status}`);
          setHasActiveSession(false);
          return null;
        }

        const data = await response.json();
        const sessionData = data.session || null;
        
        // Update our state based on whether we found a session
        setHasActiveSession(!!sessionData);
        
        return sessionData;
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Collaboration query failed:', error);
        setHasActiveSession(false);
        return null;
      }
    },
    // Key change: Only enable the query if we think there might be a session
    enabled: hasActiveSession && !!chatId,
    refetchInterval: hasActiveSession ? 30000 : false, // Only refetch if session is active
    retry: false,
    staleTime: 15000,
    gcTime: 30000,
    meta: {
      errorMessage: false,
    },
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
      // Mark that we now have an active session
      setHasActiveSession(true);
      
      // Invalidate and refetch the session query
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
      // Mark that we no longer have an active session
      setHasActiveSession(false);
      
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
      // Mark that we no longer have an active session
      setHasActiveSession(false);
      
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

  // If we don't have an active session and we're not loading, show the start button
  if (!hasActiveSession && !isLoading) {
    return (
      <Button
        onClick={() => startCollaboration.mutate()}
        disabled={startCollaboration.isPending}
        size="sm"
        variant="outline"
        className={className}
      >
        <Users className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">
          {startCollaboration.isPending ? "Starting..." : "Collaborate"}
        </span>
        <span className="sm:hidden">
          {startCollaboration.isPending ? "..." : "Collab"}
        </span>
      </Button>
    );
  }

  // If we're loading (only when hasActiveSession is true), show loading state
  if (isLoading) {
    return (
      <Button disabled size="sm" variant="outline" className={className}>
        <Users className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Loading...</span>
        <span className="sm:hidden">...</span>
      </Button>
    );
  }

  // If we have a session, show the active collaboration dropdown
  if (session) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className={className}>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="flex items-center gap-1">
                  <span className="hidden sm:inline">
                    {session.participantCount}
                    {session.participantCount === 1 ? " user" : " users"}
                  </span>
                  <span className="sm:hidden">{session.participantCount}</span>
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

  // Fallback: show start button if something went wrong
  return (
    <Button
      onClick={() => startCollaboration.mutate()}
      disabled={startCollaboration.isPending}
      size="sm"
      variant="outline"
      className={className}
    >
      <Users className="h-4 w-4 mr-2" />
      <span className="hidden sm:inline">
        {startCollaboration.isPending ? "Starting..." : "Collaborate"}
      </span>
      <span className="sm:hidden">
        {startCollaboration.isPending ? "..." : "Collab"}
      </span>
    </Button>
  );
}
