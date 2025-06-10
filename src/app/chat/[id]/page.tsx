import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { prefetchChatWithMessagesFromDB, prefetchUserChatsFromDB } from "@/lib/prefetch";
import { ChatConversation } from "@/components/chat-conversation";
import { getChatWithMessages } from "@/lib/db/chats";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const queryClient = new QueryClient();
  const supabase = await createClient();
  const { id } = await params;
  
  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return <div>Please log in to view this chat.</div>;
  }

  try {
    // Prefetch the current chat data
    await prefetchChatWithMessagesFromDB(queryClient, id, user.id);
    
    // Also prefetch the user's chat list for the sidebar
    await prefetchUserChatsFromDB(queryClient, user.id);

    // Get the chat data directly for server-side rendering
    const chat = await getChatWithMessages(id, user.id);
    
    if (!chat) {
      return <div>Chat not found.</div>;
    }

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex h-screen">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ChatConversation
              chatId={id}
              initialMessages={chat.messages}
              userId={user.id}
              chatTitle={chat.title || undefined}
              model="openai/gpt-4o-mini"
            />
          </div>
        </div>
      </HydrationBoundary>
    );
  } catch (error) {
    console.error("Error loading chat:", error);
    return <div>Error loading chat. Please try again.</div>;
  }
}

// Optional: Generate metadata
export async function generateMetadata({ params }: ChatPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { title: "Chat" };

  try {
    const chat = await getChatWithMessages(id, user.id);
    return {
      title: chat?.title || "Chat",
      description: "AI Chat Conversation",
    };
  } catch {
    return { title: "Chat" };
  }
} 