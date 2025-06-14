import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createOrJoinWithAccessControl,
  leaveCollaborationSession,
  getCollaborationSessionInfo,
  updateSessionActivity,
} from "@/lib/db/collaboration";
import { getChatInfo } from "@/lib/db/chats";

// Join a collaboration session
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

    // Get chat info
    const chat = await getChatInfo(chatId);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Use the database utility with access control
    const result = await createOrJoinWithAccessControl(
      chatId,
      user.id,
      chat.userId === user.id,
      chat.isCollaborative
    );

    if (!result.success) {
      const statusCode = result.error === "Access denied" ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status: statusCode });
    }

    return NextResponse.json(result.sessionData);
  } catch (error) {
    console.error("Collaboration session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Leave a collaboration session
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    // Use the existing database utility
    await leaveCollaborationSession(sessionId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave collaboration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get current collaboration session info
export async function GET(
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

    // Use the database utility
    const result = await getCollaborationSessionInfo(chatId, user.id);

    if (!result.session) {
      return NextResponse.json({ session: null }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get collaboration session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update session activity (heartbeat)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    // Use the existing database utility
    await updateSessionActivity(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update session activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
