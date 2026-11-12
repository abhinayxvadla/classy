import { z } from "zod";
import { nanoid } from "nanoid";
import type { McpServer } from "@modelcontextprotocol/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeIndianPhone } from "@/lib/auth/utils";
import { APP_NAME } from "@/lib/config";
import type { Database, ItemAccess, ItemVisibility, RosterStatus } from "@/lib/database.types";

export const SERVER_INSTRUCTIONS =
  "Classy runs a tutor's classes. Usually call list_batches first to get batch ids. To create a batch from a student list, call create_batch then add_students. Content is published to a batch; use access 'premium' only when the tutor asks. Always confirm what you published and share the invite link when relevant.";

interface ToolDefinition<T extends z.ZodTypeAny> {
  name: string;
  title: string;
  description: string;
  schema: T;
  annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean };
  handler: (args: z.infer<T>) => Promise<{
    text: string;
    data?: unknown;
  }>;
}

// Helper to register tools supporting both McpServer.registerTool and McpServer.tool
function registerClassyTool<T extends z.ZodTypeAny>(
  server: McpServer,
  def: ToolDefinition<T>
) {
  const toolCallback = async (args: z.infer<T>) => {
    try {
      const res = await def.handler(args);
      return {
        content: [
          { type: "text" as const, text: res.text },
          ...(res.data !== undefined
            ? [{ type: "text" as const, text: JSON.stringify(res.data, null, 2) }]
            : []),
        ],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text" as const, text: `Error: ${message}` }],
      };
    }
  };

  const serverObj = server as unknown as {
    registerTool?: (...args: unknown[]) => unknown;
    tool?: (...args: unknown[]) => unknown;
  };

  if (typeof serverObj.registerTool === "function") {
    serverObj.registerTool(
      def.name,
      {
        title: def.title,
        description: def.description,
        inputSchema: def.schema,
        annotations: def.annotations,
      },
      toolCallback
    );
  } else if (typeof serverObj.tool === "function") {
    serverObj.tool(def.name, def.description, def.schema, toolCallback);
  }
}

/**
 * Register all 15 Classy tools bound strictly to the authenticated tutor's ID
 */
export function registerClassyTools(
  server: McpServer,
  tutorId: string,
  adminClient?: SupabaseClient<Database>
) {
  const admin = adminClient || createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // ---------------------------------------------------------------------------
  // 1. list_batches
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "list_batches",
    title: "List Batches",
    description:
      "List all batches/classes created by this tutor, including student counts (joined and pending approval) and published item counts.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
    handler: async () => {
      const { data: batches, error } = await admin
        .from("batches")
        .select("id, name, subject, grade, description, join_code, premium_price_inr, created_at")
        .eq("tutor_id", tutorId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      if (!batches || batches.length === 0) {
        return {
          text: "You haven't created any batches yet. Call create_batch to set up your first class.",
          data: [],
        };
      }

      const results = await Promise.all(
        batches.map(async (b) => {
          const { count: joinedCount } = await admin
            .from("roster")
            .select("*", { count: "exact", head: true })
            .eq("batch_id", b.id)
            .eq("status", "joined");

          const { count: pendingCount } = await admin
            .from("roster")
            .select("*", { count: "exact", head: true })
            .eq("batch_id", b.id)
            .eq("status", "pending");

          const { count: itemCount } = await admin
            .from("items")
            .select("*", { count: "exact", head: true })
            .eq("batch_id", b.id)
            .eq("published", true);

          return {
            id: b.id,
            name: b.name,
            subject: b.subject,
            grade: b.grade,
            join_code: b.join_code,
            invite_url: `${appUrl}/join/${b.join_code}`,
            joined: joinedCount || 0,
            pending: pendingCount || 0,
            items: itemCount || 0,
            premium_price_inr: b.premium_price_inr,
          };
        })
      );

      const summary = results
        .map(
          (b) =>
            `• ${b.name} (${b.subject || "General"}${b.grade ? ` • ${b.grade}` : ""}) | Code: ${b.join_code} | ${b.joined} students (${b.pending} pending) | ${b.items} items`
        )
        .join("\n");

      return {
        text: `Found ${results.length} batches:\n${summary}`,
        data: results,
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 2. create_batch
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "create_batch",
    title: "Create Batch",
    description:
      "Create a new batch/classroom for students. Generates a unique 6-character join code and shareable invite link.",
    schema: z.object({
      name: z.string().min(1, "Batch name is required"),
      subject: z.string().optional(),
      grade: z.string().optional(),
      description: z.string().optional(),
      premium_price_inr: z.number().int().min(0).optional().default(0),
    }),
    annotations: { destructiveHint: false },
    handler: async (args) => {
      const { data: codeData, error: codeErr } = await admin.rpc("generate_join_code");
      if (codeErr || !codeData) {
        throw new Error("Failed to generate unique join code");
      }

      const { data: batch, error } = await admin
        .from("batches")
        .insert({
          tutor_id: tutorId,
          name: args.name.trim(),
          subject: args.subject?.trim() || null,
          grade: args.grade?.trim() || null,
          description: args.description?.trim() || null,
          join_code: codeData,
          premium_price_inr: args.premium_price_inr || 0,
        })
        .select()
        .single();

      if (error || !batch) {
        throw new Error(error?.message || "Failed to create batch");
      }

      const inviteUrl = `${appUrl}/join/${codeData}`;
      return {
        text: `Created batch "${batch.name}" successfully!\nJoin Code: ${codeData}\nInvite Link: ${inviteUrl}`,
        data: {
          id: batch.id,
          name: batch.name,
          subject: batch.subject,
          grade: batch.grade,
          join_code: codeData,
          invite_url: inviteUrl,
          premium_price_inr: batch.premium_price_inr,
        },
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 3. add_students
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "add_students",
    title: "Add Students to Roster",
    description:
      "Add up to 500 students to a batch roster. Deduplicates by email and phone. If a student account with that email/phone already exists, links them and marks them joined; otherwise adds them as invited.",
    schema: z.object({
      batch_id: z.string().uuid("Invalid batch UUID"),
      students: z
        .array(
          z.object({
            full_name: z.string().min(1, "Student full_name is required"),
            email: z.string().email().optional().or(z.literal("")),
            phone: z.string().optional().or(z.literal("")),
          })
        )
        .min(1, "Provide at least 1 student")
        .max(500, "Maximum 500 students per batch"),
    }),
    annotations: { destructiveHint: false },
    handler: async (args) => {
      // Verify ownership
      const { data: batch } = await admin
        .from("batches")
        .select("id, name")
        .eq("id", args.batch_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!batch) throw new Error("Batch not found or unauthorized");

      // Fetch existing roster to dedupe
      const { data: existingRoster } = await admin
        .from("roster")
        .select("email, phone")
        .eq("batch_id", args.batch_id);

      const existingEmails = new Set(
        existingRoster?.map((r) => r.email?.toLowerCase()).filter(Boolean)
      );
      const existingPhones = new Set(
        existingRoster?.map((r) => r.phone).filter(Boolean)
      );

      let added = 0;
      let alreadyPresent = 0;
      let autoJoined = 0;

      const rowsToInsert: Array<{
        batch_id: string;
        full_name: string;
        email: string | null;
        phone: string | null;
        status: RosterStatus;
        student_id: string | null;
        joined_at: string | null;
      }> = [];

      for (const s of args.students) {
        const email = s.email?.trim().toLowerCase() || null;
        const phone = s.phone ? normalizeIndianPhone(s.phone) : null;

        if (email && existingEmails.has(email)) {
          alreadyPresent++;
          continue;
        }
        if (phone && existingPhones.has(phone)) {
          alreadyPresent++;
          continue;
        }

        // Try matching registered student profile
        let studentId: string | null = null;
        if (email) {
          const { data: match } = await admin
            .from("profiles")
            .select("id")
            .eq("role", "student")
            .eq("email", email)
            .maybeSingle();
          if (match) studentId = match.id;
        }
        if (!studentId && phone) {
          const { data: match } = await admin
            .from("profiles")
            .select("id")
            .eq("role", "student")
            .eq("phone", phone)
            .maybeSingle();
          if (match) studentId = match.id;
        }

        const isAutoJoin = Boolean(studentId);
        if (isAutoJoin) autoJoined++;
        else added++;

        rowsToInsert.push({
          batch_id: args.batch_id,
          full_name: s.full_name.trim(),
          email,
          phone,
          status: isAutoJoin ? "joined" : "invited",
          student_id: studentId,
          joined_at: isAutoJoin ? new Date().toISOString() : null,
        });

        if (email) existingEmails.add(email);
        if (phone) existingPhones.add(phone);
      }

      if (rowsToInsert.length > 0) {
        const { error: insErr } = await admin.from("roster").insert(rowsToInsert);
        if (insErr) throw new Error(insErr.message);
      }

      return {
        text: `Roster update complete for "${batch.name}":\n• ${added} invited\n• ${autoJoined} auto-joined (matching existing student accounts)\n• ${alreadyPresent} already present on roster`,
        data: { added, auto_joined: autoJoined, already_present: alreadyPresent },
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 4. get_invite_link
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "get_invite_link",
    title: "Get Batch Invite Link",
    description:
      "Get the invite link, 6-character join code, and ready-to-send WhatsApp invite message for a batch.",
    schema: z.object({
      batch_id: z.string().uuid("Invalid batch UUID"),
    }),
    annotations: { readOnlyHint: true },
    handler: async (args) => {
      const { data: batch } = await admin
        .from("batches")
        .select("id, name, join_code")
        .eq("id", args.batch_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!batch) throw new Error("Batch not found or unauthorized");

      const inviteUrl = `${appUrl}/join/${batch.join_code}`;
      const whatsappMessage = `Join our batch "${batch.name}" on ${APP_NAME}! Code: ${batch.join_code}\nInvite Link: ${inviteUrl}`;

      return {
        text: `Invite Link for "${batch.name}":\n${inviteUrl}\n\nJoin Code: ${batch.join_code}\n\nWhatsApp Message:\n${whatsappMessage}`,
        data: {
          invite_url: inviteUrl,
          join_code: batch.join_code,
          whatsapp_message: whatsappMessage,
        },
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 5. list_students
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "list_students",
    title: "List Students in Batch",
    description:
      "List all students in a batch roster, optionally filtered by status ('joined', 'pending', 'invited', 'rejected').",
    schema: z.object({
      batch_id: z.string().uuid("Invalid batch UUID"),
      status: z.enum(["joined", "pending", "invited", "rejected"]).optional(),
    }),
    annotations: { readOnlyHint: true },
    handler: async (args) => {
      const { data: batch } = await admin
        .from("batches")
        .select("id, name")
        .eq("id", args.batch_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!batch) throw new Error("Batch not found or unauthorized");

      let query = admin
        .from("roster")
        .select("id, full_name, email, phone, status, student_id, joined_at")
        .eq("batch_id", args.batch_id)
        .order("full_name", { ascending: true });

      if (args.status) {
        query = query.eq("status", args.status);
      }

      const { data: students, error } = await query;
      if (error) throw new Error(error.message);

      const count = students?.length || 0;
      const summary =
        count === 0
          ? "No students match this query."
          : students!
              .map(
                (s) =>
                  `• ${s.full_name} [${s.status.toUpperCase()}] ${s.email ? `(${s.email})` : ""} ${s.phone || ""}`
              )
              .join("\n");

      return {
        text: `Roster for "${batch.name}" (${count} students):\n${summary}`,
        data: students || [],
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 6. approve_student
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "approve_student",
    title: "Approve or Reject Student",
    description: "Approve or reject a student's pending join request for a batch.",
    schema: z.object({
      batch_id: z.string().uuid("Invalid batch UUID"),
      roster_id: z.string().uuid("Invalid roster UUID"),
      approve: z.boolean(),
    }),
    annotations: { destructiveHint: false },
    handler: async (args) => {
      // Verify tutor owns batch
      const { data: batch } = await admin
        .from("batches")
        .select("id, name")
        .eq("id", args.batch_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!batch) throw new Error("Batch not found or unauthorized");

      const newStatus: RosterStatus = args.approve ? "joined" : "rejected";
      const { data: updated, error } = await admin
        .from("roster")
        .update({
          status: newStatus,
          joined_at: args.approve ? new Date().toISOString() : null,
        })
        .eq("id", args.roster_id)
        .eq("batch_id", args.batch_id)
        .select("id, full_name, status")
        .single();

      if (error || !updated) {
        throw new Error(error?.message || "Failed to update student status");
      }

      const action = args.approve ? "Approved" : "Rejected";
      return {
        text: `${action} join request for ${updated.full_name} in "${batch.name}". Status is now ${newStatus}.`,
        data: { roster_id: updated.id, status: updated.status },
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 7. publish_quiz
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "publish_quiz",
    title: "Publish Quiz",
    description:
      "Publish an interactive multiple-choice quiz (1 to 100 questions) to a batch. Correct answers are automatically stored securely in quiz_keys and never exposed in the public quiz body.",
    schema: z.object({
      batch_id: z.string().uuid("Invalid batch UUID"),
      title: z.string().min(1, "Quiz title is required"),
      instructions: z.string().optional().default("Select the best answer for each question."),
      time_limit_min: z.number().int().min(1).optional(),
      due_at: z.string().datetime().optional().nullable(),
      access: z.enum(["free", "premium"]).optional().default("free"),
      visibility: z.enum(["batch", "public"]).optional().default("batch"),
      questions: z
        .array(
          z.object({
            text: z.string().min(1, "Question text is required"),
            options: z
              .array(z.string().min(1, "Option cannot be empty"))
              .min(2, "At least 2 options required")
              .max(6, "Maximum 6 options allowed"),
            correct_option_index: z.number().int().min(0, "correct_option_index must be >= 0"),
            marks: z.number().int().min(1).optional().default(1),
            explanation: z.string().optional(),
          })
        )
        .min(1, "Provide at least 1 question")
        .max(100, "Maximum 100 questions per quiz"),
    }),
    annotations: { destructiveHint: false },
    handler: async (args) => {
      const { data: batch } = await admin
        .from("batches")
        .select("id, name, subject, grade")
        .eq("id", args.batch_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!batch) throw new Error("Batch not found or unauthorized");

      // Validate question correct option indices
      for (let i = 0; i < args.questions.length; i++) {
        const q = args.questions[i];
        if (q.correct_option_index >= q.options.length) {
          throw new Error(
            `Question ${i + 1} ("${q.text.slice(0, 30)}...") has correct_option_index ${q.correct_option_index}, but only has ${q.options.length} options (indices 0 to ${q.options.length - 1}).`
          );
        }
      }

      // Safe visibility check
      const access: ItemAccess = args.access || "free";
      const safeVisibility: ItemVisibility = access === "premium" ? "batch" : (args.visibility || "batch");

      // Split questions and answers
      const answersMap: Record<string, number> = {};
      let totalMarks = 0;

      const cleanQuestions = args.questions.map((q, idx) => {
        const qId = `q_${idx}_${nanoid(6)}`;
        answersMap[qId] = q.correct_option_index;
        const marks = Number(q.marks) || 1;
        totalMarks += marks;

        return {
          id: qId,
          text: q.text.trim(),
          options: q.options.map((o) => o.trim()),
          marks,
          explanation: q.explanation?.trim() || "",
        };
      });

      const bodyPayload = {
        instructions: args.instructions.trim(),
        time_limit_minutes: args.time_limit_min ?? null,
        questions: cleanQuestions,
      };

      // Insert into items
      const { data: item, error: itemErr } = await admin
        .from("items")
        .insert({
          batch_id: args.batch_id,
          tutor_id: tutorId,
          type: "quiz",
          title: args.title.trim(),
          body: bodyPayload,
          access,
          visibility: safeVisibility,
          grade: batch.grade,
          subject: batch.subject,
          due_at: args.due_at || null,
          max_marks: totalMarks,
          published: true,
        })
        .select()
        .single();

      if (itemErr || !item) {
        throw new Error(itemErr?.message || "Failed to publish quiz");
      }

      // Insert answers into quiz_keys
      const { error: keyErr } = await admin.from("quiz_keys").insert({
        item_id: item.id,
        answers: answersMap,
      });

      if (keyErr) throw new Error(keyErr.message);

      const editUrl = `${appUrl}/t/items/${item.id}`;
      return {
        text: `Published quiz "${item.title}" to batch "${batch.name}":\n• Questions: ${cleanQuestions.length}\n• Total Marks: ${totalMarks}\n• Access: ${access.toUpperCase()} (${safeVisibility})\n• Edit in Classy: ${editUrl}`,
        data: {
          id: item.id,
          title: item.title,
          batch_id: item.batch_id,
          questions_count: cleanQuestions.length,
          total_marks: totalMarks,
          edit_url: editUrl,
        },
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 8. publish_notes
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "publish_notes",
    title: "Publish Notes",
    description:
      "Publish study or revision notes written in Markdown (with LaTeX math support $...$, $$...$$) to a batch.",
    schema: z.object({
      batch_id: z.string().uuid("Invalid batch UUID"),
      title: z.string().min(1, "Title is required"),
      markdown: z.string().min(1, "Markdown content is required"),
      access: z.enum(["free", "premium"]).optional().default("free"),
      visibility: z.enum(["batch", "public"]).optional().default("batch"),
    }),
    annotations: { destructiveHint: false },
    handler: async (args) => {
      const { data: batch } = await admin
        .from("batches")
        .select("id, name, subject, grade")
        .eq("id", args.batch_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!batch) throw new Error("Batch not found or unauthorized");

      const access: ItemAccess = args.access || "free";
      const safeVisibility: ItemVisibility = access === "premium" ? "batch" : (args.visibility || "batch");

      const { data: item, error } = await admin
        .from("items")
        .insert({
          batch_id: args.batch_id,
          tutor_id: tutorId,
          type: "notes",
          title: args.title.trim(),
          body: { content: args.markdown.trim() },
          access,
          visibility: safeVisibility,
          grade: batch.grade,
          subject: batch.subject,
          published: true,
        })
        .select()
        .single();

      if (error || !item) throw new Error(error?.message || "Failed to publish notes");

      const editUrl = `${appUrl}/t/items/${item.id}`;
      return {
        text: `Published notes "${item.title}" to batch "${batch.name}" (${access.toUpperCase()} • ${safeVisibility}):\nEdit URL: ${editUrl}`,
        data: { id: item.id, title: item.title, edit_url: editUrl },
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 9. publish_assignment
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "publish_assignment",
    title: "Publish Assignment",
    description:
      "Publish an assignment with markdown instructions, submission format ('text', 'link', 'both'), maximum marks, and optional rubric to a batch.",
    schema: z.object({
      batch_id: z.string().uuid("Invalid batch UUID"),
      title: z.string().min(1, "Title is required"),
      instructions_markdown: z.string().min(1, "Instructions are required"),
      submission_type: z.enum(["text", "link", "both"]).optional().default("both"),
      max_marks: z.number().int().min(1).optional().default(100),
      due_at: z.string().datetime().optional().nullable(),
      rubric: z.string().optional(),
      access: z.enum(["free", "premium"]).optional().default("free"),
    }),
    annotations: { destructiveHint: false },
    handler: async (args) => {
      const { data: batch } = await admin
        .from("batches")
        .select("id, name, subject, grade")
        .eq("id", args.batch_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!batch) throw new Error("Batch not found or unauthorized");

      const access: ItemAccess = args.access || "free";
      const submissionType = args.submission_type || "both";
      const maxMarks = args.max_marks ?? 100;

      const { data: item, error } = await admin
        .from("items")
        .insert({
          batch_id: args.batch_id,
          tutor_id: tutorId,
          type: "assignment",
          title: args.title.trim(),
          body: {
            instructions: args.instructions_markdown.trim(),
            submission_type: submissionType,
            rubric: args.rubric?.trim() || "",
          },
          access,
          visibility: "batch",
          max_marks: maxMarks,
          due_at: args.due_at || null,
          grade: batch.grade,
          subject: batch.subject,
          published: true,
        })
        .select()
        .single();

      if (error || !item) throw new Error(error?.message || "Failed to publish assignment");

      const editUrl = `${appUrl}/t/items/${item.id}`;
      return {
        text: `Published assignment "${item.title}" to batch "${batch.name}":\n• Max Marks: ${maxMarks}\n• Submission: ${submissionType}\n• Edit URL: ${editUrl}`,
        data: { id: item.id, title: item.title, edit_url: editUrl },
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 10. post_announcement
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "post_announcement",
    title: "Post Announcement",
    description: "Post an announcement message to all students in a batch.",
    schema: z.object({
      batch_id: z.string().uuid("Invalid batch UUID"),
      title: z.string().min(1, "Title is required"),
      message: z.string().min(1, "Message is required"),
    }),
    annotations: { destructiveHint: false },
    handler: async (args) => {
      const { data: batch } = await admin
        .from("batches")
        .select("id, name")
        .eq("id", args.batch_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!batch) throw new Error("Batch not found or unauthorized");

      const { data: item, error } = await admin
        .from("items")
        .insert({
          batch_id: args.batch_id,
          tutor_id: tutorId,
          type: "announcement",
          title: args.title.trim(),
          body: { message: args.message.trim() },
          access: "free",
          visibility: "batch",
          published: true,
        })
        .select()
        .single();

      if (error || !item) throw new Error(error?.message || "Failed to post announcement");

      return {
        text: `Posted announcement "${item.title}" to batch "${batch.name}".`,
        data: { id: item.id, title: item.title, batch_id: item.batch_id },
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 11. list_items
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "list_items",
    title: "List Items in Batch",
    description:
      "List all content items (quizzes, notes, assignments, announcements) published in a batch with status and submission/attempt counts.",
    schema: z.object({
      batch_id: z.string().uuid("Invalid batch UUID"),
      type: z.enum(["quiz", "notes", "assignment", "announcement"]).optional(),
    }),
    annotations: { readOnlyHint: true },
    handler: async (args) => {
      const { data: batch } = await admin
        .from("batches")
        .select("id, name")
        .eq("id", args.batch_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!batch) throw new Error("Batch not found or unauthorized");

      let query = admin
        .from("items")
        .select("id, type, title, access, visibility, due_at, max_marks, published, created_at")
        .eq("batch_id", args.batch_id)
        .eq("tutor_id", tutorId)
        .order("created_at", { ascending: false });

      if (args.type) {
        query = query.eq("type", args.type);
      }

      const { data: items, error } = await query;
      if (error) throw new Error(error.message);

      const itemsWithStats = await Promise.all(
        (items || []).map(async (item) => {
          let stats: Record<string, unknown> = {};
          if (item.type === "quiz") {
            const { count } = await admin
              .from("attempts")
              .select("*", { count: "exact", head: true })
              .eq("item_id", item.id);
            stats = { attempts: count || 0 };
          } else if (item.type === "assignment") {
            const { count } = await admin
              .from("submissions")
              .select("*", { count: "exact", head: true })
              .eq("item_id", item.id);
            stats = { submissions: count || 0 };
          }
          return { ...item, stats };
        })
      );

      const summary =
        itemsWithStats.length === 0
          ? "No items found."
          : itemsWithStats
              .map(
                (i) =>
                  `• [${i.type.toUpperCase()}] ${i.title} (${i.access} • ${i.published ? "published" : "draft"})`
              )
              .join("\n");

      return {
        text: `Items in "${batch.name}" (${itemsWithStats.length} items):\n${summary}`,
        data: itemsWithStats,
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 12. update_item
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "update_item",
    title: "Update Item",
    description:
      "Update an existing item's metadata or content. For quizzes, replacing questions also updates quiz_keys securely.",
    schema: z.object({
      item_id: z.string().uuid("Invalid item UUID"),
      title: z.string().min(1).optional(),
      access: z.enum(["free", "premium"]).optional(),
      visibility: z.enum(["batch", "public"]).optional(),
      published: z.boolean().optional(),
      due_at: z.string().datetime().optional().nullable(),
      markdown: z.string().optional(),
      instructions_markdown: z.string().optional(),
      message: z.string().optional(),
      questions: z
        .array(
          z.object({
            text: z.string().min(1),
            options: z.array(z.string().min(1)).min(2).max(6),
            correct_option_index: z.number().int().min(0),
            marks: z.number().int().min(1).optional().default(1),
            explanation: z.string().optional(),
          })
        )
        .optional(),
    }),
    annotations: { destructiveHint: false },
    handler: async (args) => {
      const { data: item } = await admin
        .from("items")
        .select("*")
        .eq("id", args.item_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!item) throw new Error("Item not found or unauthorized");

      const updatePayload: Database["public"]["Tables"]["items"]["Update"] = {};
      if (args.title !== undefined) updatePayload.title = args.title.trim();
      if (args.access !== undefined) updatePayload.access = args.access;
      if (args.published !== undefined) updatePayload.published = args.published;
      if (args.due_at !== undefined) updatePayload.due_at = args.due_at;

      // Visibility rule: premium items must be batch visibility
      if (args.access === "premium") {
        updatePayload.visibility = "batch";
      } else if (args.visibility !== undefined) {
        updatePayload.visibility = args.visibility;
      }

      // Handle type-specific body updates
      const currentBody = (item.body as Record<string, unknown>) || {};

      if (item.type === "notes" && args.markdown !== undefined) {
        updatePayload.body = { ...currentBody, content: args.markdown.trim() };
      } else if (item.type === "assignment" && args.instructions_markdown !== undefined) {
        updatePayload.body = { ...currentBody, instructions: args.instructions_markdown.trim() };
      } else if (item.type === "announcement" && args.message !== undefined) {
        updatePayload.body = { message: args.message.trim() };
      } else if (item.type === "quiz" && args.questions !== undefined) {
        const answersMap: Record<string, number> = {};
        let totalMarks = 0;

        const cleanQuestions = args.questions.map((q, idx) => {
          if (q.correct_option_index >= q.options.length) {
            throw new Error(`Question ${idx + 1} has invalid correct_option_index`);
          }
          const qId = `q_${idx}_${nanoid(6)}`;
          answersMap[qId] = q.correct_option_index;
          const marks = Number(q.marks) || 1;
          totalMarks += marks;
          return {
            id: qId,
            text: q.text.trim(),
            options: q.options.map((o) => o.trim()),
            marks,
            explanation: q.explanation?.trim() || "",
          };
        });

        updatePayload.body = {
          ...currentBody,
          questions: cleanQuestions,
        };
        updatePayload.max_marks = totalMarks;

        // Upsert quiz_keys
        await admin.from("quiz_keys").upsert({
          item_id: item.id,
          answers: answersMap,
        });
      }

      const { error } = await admin
        .from("items")
        .update(updatePayload)
        .eq("id", args.item_id);

      if (error) throw new Error(error.message);

      return {
        text: `Updated item "${args.title || item.title}" successfully.`,
        data: { item_id: item.id, updated: Object.keys(updatePayload) },
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 13. get_results
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "get_results",
    title: "Get Quiz Results & Analytics",
    description:
      "Get detailed quiz analytics: average score %, attempts vs members, per-student scorecards, per-question accuracy (% correct) with hardest questions identified, and unattempted students list.",
    schema: z.object({
      batch_id: z.string().uuid("Invalid batch UUID"),
      item_id: z.string().uuid("Optional item UUID for a specific quiz").optional(),
    }),
    annotations: { readOnlyHint: true },
    handler: async (args) => {
      const { data: batch } = await admin
        .from("batches")
        .select("id, name")
        .eq("id", args.batch_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!batch) throw new Error("Batch not found or unauthorized");

      // Fetch joined students on roster
      const { data: joinedRoster } = await admin
        .from("roster")
        .select("student_id, full_name, email")
        .eq("batch_id", args.batch_id)
        .eq("status", "joined");

      const joinedCount = joinedRoster?.length || 0;

      // Fetch quizzes
      let quizQuery = admin
        .from("items")
        .select("id, title, body, max_marks")
        .eq("batch_id", args.batch_id)
        .eq("type", "quiz")
        .eq("tutor_id", tutorId);

      if (args.item_id) {
        quizQuery = quizQuery.eq("id", args.item_id);
      }

      const { data: quizzes, error } = await quizQuery;
      if (error) throw new Error(error.message);

      if (!quizzes || quizzes.length === 0) {
        return {
          text: `No quizzes found in batch "${batch.name}".`,
          data: [],
        };
      }

      const quizAnalytics = await Promise.all(
        quizzes.map(async (q) => {
          // Fetch attempts
          const { data: attempts } = await admin
            .from("attempts")
            .select(`
              id,
              student_id,
              score,
              total,
              answers,
              submitted_at,
              profiles:student_id (
                full_name,
                email
              )
            `)
            .eq("item_id", q.id)
            .order("score", { ascending: false });

          const attList = attempts || [];
          const attemptCount = attList.length;

          // Average score %
          let averagePercent = 0;
          if (attemptCount > 0) {
            const totalPercent = attList.reduce((acc, a) => {
              const s = Number(a.score) || 0;
              const t = Number(a.total) || 1;
              return acc + (s / t) * 100;
            }, 0);
            averagePercent = Math.round(totalPercent / attemptCount);
          }

          // Student scores
          const studentScores = attList.map((a) => {
            const p = a.profiles as unknown as { full_name?: string; email?: string } | null;
            const s = Number(a.score) || 0;
            const t = Number(a.total) || 1;
            return {
              student_id: a.student_id,
              student_name: p?.full_name || "Student",
              student_email: p?.email || null,
              score: s,
              total: t,
              percent: Math.round((s / t) * 100),
              submitted_at: a.submitted_at,
            };
          });

          // Unattempted students
          const attemptedIds = new Set(attList.map((a) => a.student_id));
          const notAttempted = (joinedRoster || [])
            .filter((r) => r.student_id && !attemptedIds.has(r.student_id))
            .map((r) => ({
              student_id: r.student_id,
              student_name: r.full_name,
              student_email: r.email,
            }));

          // Question accuracy
          const { data: keyRow } = await admin
            .from("quiz_keys")
            .select("answers")
            .eq("item_id", q.id)
            .maybeSingle();

          const keyAnswers = (keyRow?.answers as Record<string, number>) || {};
          const bodyQuestions =
            ((q.body as Record<string, unknown>)?.questions as Array<{
              id: string;
              text: string;
            }>) || [];

          const questionAccuracy = bodyQuestions.map((bq, index) => {
            const correctOpt = keyAnswers[bq.id];
            let correctCount = 0;

            attList.forEach((att) => {
              const studentAns = (att.answers as Record<string, number>)?.[bq.id];
              if (studentAns !== undefined && correctOpt !== undefined && studentAns === correctOpt) {
                correctCount++;
              }
            });

            const accuracy = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0;
            return {
              question_index: index + 1,
              question_id: bq.id,
              text: bq.text,
              accuracy_percent: accuracy,
              correct_attempts: correctCount,
              total_attempts: attemptCount,
              is_hard: accuracy < 50,
            };
          });

          return {
            quiz_id: q.id,
            title: q.title,
            average_percent: averagePercent,
            attempts_count: attemptCount,
            joined_members: joinedCount,
            hardest_questions: questionAccuracy.filter((qa) => qa.is_hard),
            question_accuracy: questionAccuracy,
            student_scores: studentScores,
            not_attempted: notAttempted,
          };
        })
      );

      const summary = quizAnalytics
        .map((qa) => {
          const hardest = qa.hardest_questions.map((h) => `    Q${h.question_index}: "${h.text}" (${h.accuracy_percent}% correct)`).join("\n");
          return `• ${qa.title}: ${qa.average_percent}% avg score | ${qa.attempts_count}/${qa.joined_members} attempted\n${
            hardest ? `  Hardest Questions (<50% correct):\n${hardest}\n` : ""
          }  Unattempted: ${qa.not_attempted.length} students`;
        })
        .join("\n\n");

      return {
        text: `Quiz Analytics for "${batch.name}":\n\n${summary}`,
        data: quizAnalytics,
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 14. list_submissions
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "list_submissions",
    title: "List Assignment Submissions",
    description:
      "List student assignment submissions for grading, with student names, submitted answers or links, status ('submitted', 'graded', 'released'), marks, and feedback.",
    schema: z.object({
      item_id: z.string().uuid("Invalid item UUID"),
      status: z.enum(["submitted", "graded", "released"]).optional(),
    }),
    annotations: { readOnlyHint: true },
    handler: async (args) => {
      const { data: item } = await admin
        .from("items")
        .select("id, title, max_marks")
        .eq("id", args.item_id)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (!item) throw new Error("Assignment not found or unauthorized");

      let query = admin
        .from("submissions")
        .select(`
          id,
          student_id,
          text_answer,
          link_url,
          marks,
          feedback,
          status,
          submitted_at,
          graded_at,
          released_at,
          profiles:student_id (
            full_name,
            email
          )
        `)
        .eq("item_id", args.item_id)
        .order("submitted_at", { ascending: false });

      if (args.status) {
        query = query.eq("status", args.status);
      }

      const { data: submissions, error } = await query;
      if (error) throw new Error(error.message);

      const subList = (submissions || []).map((s) => {
        const p = s.profiles as unknown as { full_name?: string; email?: string } | null;
        return {
          id: s.id,
          student_name: p?.full_name || "Student",
          student_email: p?.email || null,
          text_answer: s.text_answer,
          link_url: s.link_url,
          marks: s.marks,
          feedback: s.feedback,
          status: s.status,
          submitted_at: s.submitted_at,
          graded_at: s.graded_at,
          released_at: s.released_at,
        };
      });

      const summary =
        subList.length === 0
          ? "No submissions found."
          : subList
              .map(
                (s) =>
                  `• ${s.student_name}: [${s.status.toUpperCase()}] ${
                    s.marks != null ? `${s.marks}/${item.max_marks || "?"} marks` : "Ungraded"
                  } (Submitted: ${new Date(s.submitted_at).toLocaleDateString()})`
              )
              .join("\n");

      return {
        text: `Submissions for "${item.title}" (${subList.length}):\n${summary}`,
        data: subList,
      };
    },
  });

  // ---------------------------------------------------------------------------
  // 15. grade_submission
  // ---------------------------------------------------------------------------
  registerClassyTool(server, {
    name: "grade_submission",
    title: "Grade Assignment Submission",
    description:
      "Grade a student's assignment submission with marks and feedback. Set release: true to publish marks and feedback to the student immediately.",
    schema: z.object({
      submission_id: z.string().uuid("Invalid submission UUID"),
      marks: z.number().min(0, "Marks must be >= 0"),
      feedback: z.string().optional().nullable(),
      release: z.boolean().optional().default(false),
    }),
    annotations: { destructiveHint: false },
    handler: async (args) => {
      // Verify ownership through item
      const { data: sub } = await admin
        .from("submissions")
        .select(`
          id,
          item_id,
          items!inner (
            id,
            title,
            max_marks,
            tutor_id
          )
        `)
        .eq("id", args.submission_id)
        .maybeSingle();

      if (!sub || (sub.items as unknown as { tutor_id: string })?.tutor_id !== tutorId) {
        throw new Error("Submission not found or unauthorized");
      }

      const itemInfo = sub.items as unknown as { max_marks: number | null; title: string };
      if (itemInfo.max_marks != null && args.marks > itemInfo.max_marks) {
        throw new Error(`Marks (${args.marks}) cannot exceed max marks (${itemInfo.max_marks})`);
      }

      const now = new Date().toISOString();
      const status: "graded" | "released" = args.release ? "released" : "graded";

      const { error } = await admin
        .from("submissions")
        .update({
          marks: args.marks,
          feedback: args.feedback?.trim() || null,
          status,
          graded_at: now,
          released_at: args.release ? now : null,
        })
        .eq("id", args.submission_id);

      if (error) throw new Error(error.message);

      return {
        text: `Graded submission: ${args.marks}/${itemInfo.max_marks ?? "?"} marks recorded (Status: ${status}).`,
        data: {
          submission_id: args.submission_id,
          marks: args.marks,
          status,
          feedback: args.feedback || null,
        },
      };
    },
  });
}
