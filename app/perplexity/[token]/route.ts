import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOpenApiSpec } from "@/lib/mcp/openapi";

export const maxDuration = 60;

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(req: Request, context: RouteContext) {
  const { token } = await context.params;

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

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (req.headers.get("host") ? `https://${req.headers.get("host")}` : "http://localhost:3000");

  const spec = generateOpenApiSpec(token, appUrl);

  return new NextResponse(JSON.stringify(spec, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
