import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatConversation } from "@/components/chat-conversation";
import { ChatHeader } from "@/components/chat-header";
import { getChatWithMessages } from "@/lib/db/chats";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const supabase = await createClient();
  const { id } = await params;

  // Check authentication
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect("/auth/login");
  }

  // Fetch chat data from database
  const chatData = await getChatWithMessages(id, userData.user.id);

  // If chat doesn't exist or doesn't belong to user, redirect
  if (!chatData || chatData.userId !== userData.user.id) {
    redirect("/protected");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Dynamic Chat Header */}
      <ChatHeader
        chatId={id}
        userId={userData.user.id}
        initialTitle={chatData.title}
        initialUpdatedAt={chatData.updatedAt}
      />

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatConversation
          chatId={id}
          initialMessages={chatData.messages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant",
          }))}
          userId={userData.user.id}
          chatTitle={chatData.title || undefined}
        />
      </div>
    </div>
  );
}
