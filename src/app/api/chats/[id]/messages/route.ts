import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addMessage } from "@/lib/db/chats";
import { CreateMessageSchema, ErrorResponseSchema } from "@/lib/schemas/chat";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorResponse = ErrorResponseSchema.parse({ error: "Unauthorized" });
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const { id } = await params;
    const chatId = id;

    // Validate request body
    const body = await request.json();
    const validatedData = CreateMessageSchema.parse(body);

    // Save the message
    const savedMessage = await addMessage(
      chatId,
      validatedData.role,
      validatedData.content,
      validatedData.model || undefined
    );

    return NextResponse.json({
      id: savedMessage.id,
      role: savedMessage.role,
      content: savedMessage.content,
      createdAt: savedMessage.createdAt,
      model: savedMessage.model,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    
    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      const errorResponse = ErrorResponseSchema.parse({ 
        error: "Invalid request data" 
      });
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const errorResponse = ErrorResponseSchema.parse({ 
      error: "Failed to save message" 
    });
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 