import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface BeaconPayload {
  chatId: string;
  action: {
    type: "user_leave";
    userId: string;
    userName: string;
    userColor: string;
    timestamp: number;
  };
}

// Handle beacon messages for reliable user leave announcements
export async function POST(request: NextRequest) {
  try {
    // Parse the beacon data
    const body = await request.text();
    let payload: BeaconPayload;

    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      console.warn("Failed to parse beacon payload:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Validate the payload structure
    if (!payload.chatId || !payload.action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (payload.action.type !== "user_leave") {
      return NextResponse.json(
        { error: "Invalid action type" },
        { status: 400 }
      );
    }

    const { chatId, action } = payload;

    // Validate action fields
    if (!action.userId || !action.userName || !action.userColor) {
      return NextResponse.json(
        { error: "Missing action fields" },
        { status: 400 }
      );
    }

    // Create Supabase client for server-side operations
    const supabase = await createClient();

    // Broadcast the user leave action via Supabase realtime
    const roomName = `chat-collaboration:${chatId}`;
    const channel = supabase.channel(roomName);

    try {
      // Subscribe to the channel before sending
      await channel.subscribe();

      // Send the user leave broadcast
      await channel.send({
        type: "broadcast",
        event: "user_leave",
        payload: action,
      });

      console.log(
        `Beacon: User ${action.userName} (${action.userId}) left chat ${chatId}`
      );

      // Clean up the channel safely
      try {
        await supabase.removeChannel(channel);
      } catch (cleanupError) {
        console.warn("Failed to clean up channel:", cleanupError);
        // Don't throw error for cleanup issues
      }

      return NextResponse.json({ success: true });
    } catch (broadcastError) {
      console.error(
        "Failed to broadcast user leave via beacon:",
        broadcastError
      );

      // Clean up the channel on error safely
      try {
        await supabase.removeChannel(channel);
      } catch (cleanupError) {
        console.warn("Failed to clean up channel on error:", cleanupError);
      }

      // Return success anyway - beacon failures shouldn't break the flow
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Beacon endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle preflight requests if needed
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
