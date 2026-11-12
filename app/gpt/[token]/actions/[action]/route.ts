import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { executeClassyTool } from "@/lib/mcp/tools";

export const maxDuration = 60;

interface RouteContext {
  params: Promise<{
    token: string;
    action: string;
  }>;
}

export async function POST(req: Request, context: RouteContext) {
  const { token, action } = await context.params;

  // Validate token in database
  const admin = createAdminClient();
  const { data: tokenRow, error } = await admin
    .from("mcp_tokens")
    .select("id, tutor_id, revoked_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !tokenRow || tokenRow.revoked_at) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid, missing, or revoked Classy token" },
      { status: 401 }
    );
  }

  // Update last_used_at
  await admin
    .from("mcp_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenRow.id);

  // Parse payload
  let body: Record<string, unknown> = {};
  try {
    const text = await req.text();
    if (text && text.trim().length > 0) {
      body = JSON.parse(text);
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  try {
    const result = await executeClassyTool(
      action,
      body,
      tokenRow.tutor_id,
      "ChatGPT",
      admin
    );

    return NextResponse.json(
      {
        success: true,
        text: result.text,
        data: result.data,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
