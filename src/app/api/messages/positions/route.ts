import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { batchUpdateMessagePositions } from "@/lib/db/messages";
import { batchUpdatePositionsSchema } from "@/lib/schemas/messages";
import { ZodError } from "zod";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = batchUpdatePositionsSchema.parse(body);

    // Update message positions
    await batchUpdateMessagePositions(validatedData.updates);

    return NextResponse.json({
      success: true,
      updatedCount: validatedData.updates.length,
    });
  } catch (error) {
    console.error("Error updating message positions:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update message positions" },
      { status: 500 }
    );
  }
}
