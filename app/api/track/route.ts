import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { track } from "@/lib/track";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, meta } = body;

    if (!event || typeof event !== "string") {
      return NextResponse.json({ error: "Missing event" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let actorRole: "tutor" | "student" | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      actorRole = profile?.role || null;
    }

    track({
      event,
      source: "app",
      actorId: user?.id || null,
      actorRole,
      meta: typeof meta === "object" && meta !== null ? meta : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
