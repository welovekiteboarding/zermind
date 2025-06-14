import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { endCollaborationSession } from "@/lib/db/collaboration";
import { isChatOwner } from "@/lib/db/chats";

// End collaboration session for all participants (owner only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const { sessionId } = await request.json();

    // Verify user is the owner of the chat
    const isOwner = await isChatOwner(chatId, user.id);

    if (!isOwner) {
      return NextResponse.json(
        { error: "Access denied - only chat owner can end sessions" },
        { status: 403 }
      );
    }

    // End the collaboration session using the database utility
    await endCollaborationSession(sessionId, chatId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("End collaboration session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
