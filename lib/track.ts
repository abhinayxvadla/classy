import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/database.types";

export interface TrackPayload {
  event: string;
  source: "mcp" | "app";
  actorId?: string | null;
  actorRole?: UserRole | null;
  tool?: string | null;
  clientName?: string | null;
  batchId?: string | null;
  itemId?: string | null;
  success?: boolean;
  durationMs?: number | null;
  meta?: Record<string, unknown>;
}

/**
 * Server-only fire-and-forget telemetry tracker.
 * Strictly avoids logging content, answers, passwords, or security answers.
 * Never blocks or throws to the calling thread.
 */
export function track(payload: TrackPayload): void {
  // Fire-and-forget; never block or break the request
  Promise.resolve().then(async () => {
    try {
      const admin = createAdminClient();

      // Sanitize meta: ensure no sensitive keys are ever logged
      const safeMeta: Record<string, string | number | boolean | null> = {};
      if (payload.meta && typeof payload.meta === "object") {
        for (const [k, v] of Object.entries(payload.meta)) {
          const lower = k.toLowerCase();
          if (
            lower.includes("password") ||
            lower.includes("answer") ||
            lower.includes("content") ||
            lower.includes("body") ||
            lower.includes("secret") ||
            lower.includes("token") ||
            lower.includes("instructions")
          ) {
            continue;
          }
          if (
            typeof v === "number" ||
            typeof v === "boolean" ||
            typeof v === "string" ||
            v === null
          ) {
            safeMeta[k] = v;
          }
        }
      }

      await admin.from("events").insert({
        event: payload.event,
        source: payload.source,
        actor_id: payload.actorId || null,
        actor_role: payload.actorRole || null,
        tool: payload.tool || null,
        client_name: payload.clientName || null,
        batch_id: payload.batchId || null,
        item_id: payload.itemId || null,
        success: payload.success ?? true,
        duration_ms: payload.durationMs ?? null,
        meta: safeMeta,
      });
    } catch (err) {
      console.warn("[Telemetry Track Warning]:", err instanceof Error ? err.message : err);
    }
  });
}
