import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteChat, getChatWithMessages } from "@/lib/db/chats";
import { DeleteChatResponseSchema, ErrorResponseSchema } from "@/lib/schemas/chat";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorResponse = ErrorResponseSchema.parse({ error: "Unauthorized" });
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Check if chat exists and belongs to user
    const chat = await getChatWithMessages(id, user.id);
    if (!chat) {
      const errorResponse = ErrorResponseSchema.parse({ error: "Chat not found" });
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Delete the chat
    await deleteChat(id, user.id);

    // Validate and return response
    const response = DeleteChatResponseSchema.parse({ success: true });
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting chat:", error);
    const errorResponse = ErrorResponseSchema.parse({ 
      error: "Failed to delete chat" 
    });
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
