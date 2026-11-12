import { createMcpHandler } from "mcp-handler";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerClassyTools, SERVER_INSTRUCTIONS, detectAiClient } from "@/lib/mcp/tools";

export const maxDuration = 60;

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

async function handleMcpRequest(req: Request, context: RouteContext) {
  const { token } = await context.params;

  // Look up token in database (must be active and not revoked)
  const admin = createAdminClient();
  const { data: tokenRow, error } = await admin
    .from("mcp_tokens")
    .select("id, tutor_id, revoked_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !tokenRow || tokenRow.revoked_at) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized: Invalid, missing, or revoked Classy token",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Update last_used_at timestamp
  await admin
    .from("mcp_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenRow.id);

  // Detect AI client (Claude / ChatGPT / Perplexity / Gemini / Other)
  const clientName = detectAiClient(req);

  // Initialize MCP Handler per request with the tutor_id and clientName bound
  const handler = createMcpHandler(
    async (server) => {
      registerClassyTools(server, tokenRow.tutor_id, clientName);
    },
    {
      serverInfo: { name: "Classy", version: "1.0.0" },
      instructions: SERVER_INSTRUCTIONS,
      maxSubscriptions: 0,
    }
  );

  return handler(req);
}

export async function GET(req: Request, context: RouteContext) {
  return handleMcpRequest(req, context);
}

export async function POST(req: Request, context: RouteContext) {
  return handleMcpRequest(req, context);
}

export async function DELETE(req: Request, context: RouteContext) {
  return handleMcpRequest(req, context);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
    },
  });
}
