import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DualModeChat } from "@/components/dual-mode-chat";
import { getChatWithMessages } from "@/lib/db/chats";
import { getChatCollaborationSession } from "@/lib/db/collaboration";
import { prisma } from "@/lib/prisma";
import { ZermindLogo } from "@/components/zermind-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { type Attachment } from "@/lib/schemas/chat";

interface CollaborationPageProps {
  params: Promise<{
    chatId: string;
  }>;
  searchParams: Promise<{
    collaborate?: string;
  }>;
}

export default async function CollaborationPage({ 
  params, 
  searchParams 
}: CollaborationPageProps) {
  const supabase = await createClient();
  const { chatId } = await params;
  const { collaborate } = await searchParams;

  // Check authentication
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect("/auth/login");
  }

  try {
    // Check if chat exists and get basic info
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("id, user_id, title, is_collaborative")
      .eq("id", chatId)
      .single();

    if (chatError || !chat) {
      redirect("/protected?error=chat-not-found");
    }

    // Check if there's an active collaboration session
    const collaborationSession = await getChatCollaborationSession(chatId);
    
    // Determine user's access level
    let userRole: "owner" | "collaborator" | "viewer" = "viewer";
    let hasAccess = false;

    // Chat owner always has access
    if (chat.user_id === userData.user.id) {
      userRole = "owner";
      hasAccess = true;
    } 
    // Check if user is part of active collaboration session
    else if (collaborationSession) {
      const participant = collaborationSession.participants.find(
        (p) => p.userId === userData.user.id
      );
      
      if (participant) {
        userRole = participant.role as "owner" | "collaborator" | "viewer";
        hasAccess = true;
      } 
      // If collaboration is active and user has collaboration link, auto-join as collaborator
      else if (collaborate === "true" && chat.is_collaborative) {
        try {
          // Auto-join the collaboration session
          await prisma.sessionParticipant.create({
            data: {
              sessionId: collaborationSession.id,
              userId: userData.user.id,
              role: "collaborator",
            },
          });
          
          userRole = "collaborator";
          hasAccess = true;
        } catch (error) {
          console.error("Failed to join collaboration session:", error);
          redirect("/protected?error=collaboration-join-failed");
        }
      }
    }
    // If no active session but chat is collaborative and user has link
    else if (collaborate === "true" && chat.is_collaborative) {
      try {
        // Start a new collaboration session and join
        await prisma.collaborationSession.create({
          data: {
            chatId,
            participants: {
              create: {
                userId: userData.user.id,
                role: "collaborator",
              },
            },
          },
        });
        
        userRole = "collaborator";
        hasAccess = true;
      } catch (error) {
        console.error("Failed to create collaboration session:", error);
        redirect("/protected?error=collaboration-create-failed");
      }
    }

    // If user doesn't have access, redirect with error
    if (!hasAccess) {
      redirect("/protected?error=access-denied");
    }

    // Fetch chat data with messages - for collaboration, we allow access
    // to collaborative chats even if user doesn't own them
    let chatData;
    if (chat.user_id === userData.user.id) {
      // Owner can access via normal method
      chatData = await getChatWithMessages(chatId, userData.user.id);
    } else {
      // Collaborators access via direct database query
      chatData = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    if (!chatData) {
      redirect("/protected?error=chat-not-found");
    }

    // Helper function to safely parse attachments from JSON
    const parseAttachments = (attachments: unknown): Attachment[] => {
      try {
        if (!attachments) return [];
        if (Array.isArray(attachments)) return attachments as Attachment[];
        if (typeof attachments === 'string') {
          const parsed = JSON.parse(attachments);
          return Array.isArray(parsed) ? parsed : [];
        }
        return [];
      } catch {
        return [];
      }
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header for collaboration mode */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ZermindLogo variant="compact" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Collaborative Chat</span>
                {chat.title && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{chat.title}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground capitalize">
                {userRole}
              </span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        {/* Main chat content */}
        <main className="h-[calc(100vh-73px)]">
          <DualModeChat
            chatId={chatId}
            initialMessages={chatData.messages.map((msg) => ({
              id: msg.id,
              content: msg.content,
              role: msg.role as "user" | "assistant",
              model: msg.model || undefined,
              parentId: msg.parentId || undefined,
              branchName: msg.branchName || undefined,
              attachments: parseAttachments(msg.attachments),
              createdAt: msg.createdAt.toISOString(),
            }))}
            userId={userData.user.id}
            chatTitle={chatData.title || undefined}
          />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Collaboration page error:", error);
    redirect("/protected?error=collaboration-error");
  }
} 