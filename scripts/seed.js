const { loadEnvConfig } = require("@next/env");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

// Load local environment variables from .env.local or process.env
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

// Ensure 40-character stable token
let demoMcpToken = process.env.DEMO_MCP_TOKEN;
if (!demoMcpToken || demoMcpToken.length < 40) {
  demoMcpToken = "demo_mcp_token_classy_prod_secure_40chars";
} else if (demoMcpToken.length > 40) {
  demoMcpToken = demoMcpToken.substring(0, 40);
}

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes("your-service-role-key")) {
  console.error("❌ Error: Valid NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to seed.");
  console.error("Please ensure your real Supabase Service Role key is placed in .env.local.");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_TUTOR_EMAIL = "tutor@classy.demo";
const DEMO_STUDENT_EMAIL = "student@classy.demo";
const DEMO_PASSWORD = "Demo@1234";
const SECURITY_QUESTION = "What was the name of your first school?";
const SECURITY_ANSWER = "demo";

async function findOrCreateUser({ email, password, metadata }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if profile exists
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, role")
    .eq("email", normalizedEmail)
    .maybeSingle();

  let userId;

  if (profile) {
    userId = profile.id;
    console.log(`✓ User ${normalizedEmail} already exists (${userId}). Updating password...`);
    await admin.auth.admin.updateUserById(userId, {
      password,
      user_metadata: metadata,
      email_confirm: true,
    });
    await admin.from("profiles").update({
      full_name: metadata.full_name,
      phone: metadata.phone,
      institute: metadata.institute || null,
      grade: metadata.grade || null,
      subjects: metadata.subjects || [],
      must_change_password: false,
    }).eq("id", userId);
  } else {
    console.log(`Creating user ${normalizedEmail}...`);
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (authError || !authUser.user) {
      throw new Error(`Failed to create user ${normalizedEmail}: ${authError?.message}`);
    }

    userId = authUser.user.id;

    // Ensure profiles record matches
    await admin.from("profiles").upsert({
      id: userId,
      email: normalizedEmail,
      role: metadata.role,
      full_name: metadata.full_name,
      phone: metadata.phone,
      institute: metadata.institute || null,
      grade: metadata.grade || null,
      subjects: metadata.subjects || [],
      must_change_password: false,
    });
  }

  // Upsert security answer
  const answerHash = await bcrypt.hash(SECURITY_ANSWER.trim().toLowerCase(), 10);
  await admin.from("security_answers").upsert({
    user_id: userId,
    question: SECURITY_QUESTION,
    answer_hash: answerHash,
    failed_attempts: 0,
    locked_until: null,
  });

  return userId;
}

async function seed() {
  console.log("🌱 Starting Classy database seed...");

  // 1. Create or update Demo Tutor
  const tutorId = await findOrCreateUser({
    email: DEMO_TUTOR_EMAIL,
    password: DEMO_PASSWORD,
    metadata: {
      role: "tutor",
      full_name: "Dr. Sarah Smith",
      phone: "+919876543210",
      institute: "Apex Science Academy",
      grade: null,
      subjects: ["Science", "Physics", "Chemistry"],
      must_change_password: false,
    },
  });

  // 2. Create or update Demo Student
  const studentId = await findOrCreateUser({
    email: DEMO_STUDENT_EMAIL,
    password: DEMO_PASSWORD,
    metadata: {
      role: "student",
      full_name: "Alex Johnson",
      phone: "+919876543211",
      grade: "Class 10",
      subjects: ["Science", "Physics", "Chemistry", "Biology"],
      must_change_password: false,
    },
  });

  // 3. Create or update Batch: "Class 10 Science (Batch A)"
  const batchName = "Class 10 Science (Batch A)";
  const { data: existingBatch } = await admin
    .from("batches")
    .select("id")
    .eq("tutor_id", tutorId)
    .eq("name", batchName)
    .maybeSingle();

  let batchId;
  if (existingBatch) {
    batchId = existingBatch.id;
    console.log(`✓ Batch "${batchName}" already exists (${batchId}). Updating...`);
    await admin.from("batches").update({
      subject: "Science",
      grade: "Class 10",
      description: "Comprehensive Class 10 Science coursework covering Chemical Reactions, Periodic Trends, Electricity, and Life Processes.",
      join_code: "SCI10A",
      premium_price_inr: 299,
      is_archived: false,
    }).eq("id", batchId);
  } else {
    console.log(`Creating batch "${batchName}"...`);
    const { data: newBatch, error: batchError } = await admin
      .from("batches")
      .insert({
        tutor_id: tutorId,
        name: batchName,
        subject: "Science",
        grade: "Class 10",
        description: "Comprehensive Class 10 Science coursework covering Chemical Reactions, Periodic Trends, Electricity, and Life Processes.",
        join_code: "SCI10A",
        premium_price_inr: 299,
        is_archived: false,
      })
      .select("id")
      .single();

    if (batchError || !newBatch) {
      throw new Error(`Failed to create batch: ${batchError?.message}`);
    }
    batchId = newBatch.id;
  }

  // 4. Populate Items
  console.log("Seeding coursework items (free notes, public notes, premium quiz, assignment, announcement)...");

  // Helper to upsert items by title and batch_id
  async function upsertItem(itemData) {
    const { data: existing } = await admin
      .from("items")
      .select("id")
      .eq("batch_id", batchId)
      .eq("title", itemData.title)
      .maybeSingle();

    if (existing) {
      await admin.from("items").update({ ...itemData, tutor_id: tutorId }).eq("id", existing.id);
    } else {
      await admin.from("items").insert({ ...itemData, batch_id: batchId, tutor_id: tutorId });
    }
  }

  // Item A: 1 Free Notes Item
  await upsertItem({
    type: "notes",
    title: "Chapter 1: Chemical Reactions & Equations",
    access: "free",
    visibility: "batch",
    is_published: true,
    max_marks: null,
    due_at: null,
    body: {
      content: `# Chemical Reactions & Equations

## 1. What is a Chemical Reaction?
A chemical reaction is a process that leads to the chemical transformation of one set of chemical substances to another.

### Key Observations:
- Change in state (e.g. formation of a solid precipitate)
- Change in colour
- Evolution of gas (e.g. $H_2$ gas evolution with Zinc + dilute $H_2SO_4$)
- Change in temperature (exothermic vs endothermic)

$$\\text{Zn (s)} + \\text{H}_2\\text{SO}_4 \\text{ (aq)} \\longrightarrow \\text{ZnSO}_4 \\text{ (aq)} + \\text{H}_2 \\uparrow$$

## 2. Types of Chemical Reactions
1. **Combination Reaction**: Two or more reactants combine to form a single product.
   $$\\text{CaO (s)} + \\text{H}_2\\text{O (l)} \\longrightarrow \\text{Ca(OH)}_2 \\text{ (aq)} + \\text{Heat}$$
2. **Decomposition Reaction**: A single compound breaks down into two or more simpler substances.
3. **Displacement Reaction**: More reactive element displaces a less reactive element.
4. **Double Displacement**: Exchange of ions between reactants.
5. **Redox Reactions**: Simultaneous oxidation and reduction.
`,
    },
  });

  // Item B: 1 Free Public Notes Item
  await upsertItem({
    type: "notes",
    title: "Quick Revision: Periodic Trends & Formulae (Public Summary)",
    access: "free",
    visibility: "public",
    is_published: true,
    max_marks: null,
    due_at: null,
    body: {
      content: `# Class 10 Board Revision: Periodic Table Essentials

## Periodic Trends Across a Period (Left to Right):
- **Valency**: Increases from 1 to 4, then decreases to 0.
- **Atomic Size**: Decreases due to increasing effective nuclear charge.
- **Metallic Character**: Decreases; non-metallic character increases.
- **Electronegativity**: Increases left to right across a period.

## Periodic Trends Down a Group (Top to Bottom):
- **Valency**: Remains identical for elements in the same group.
- **Atomic Radius**: Increases due to addition of electron shells.
- **Metallic Nature**: Increases down the group.
`,
    },
  });

  // Item C: 1 Premium Quiz (5 Questions with answer keys & explanations)
  await upsertItem({
    type: "quiz",
    title: "Master Quiz: Chemical Reactions & Redox (Premium)",
    access: "premium",
    visibility: "batch",
    is_published: true,
    max_marks: 10,
    due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    body: {
      questions: [
        {
          question: "When quicklime (CaO) reacts vigorously with water, what type of reaction takes place?",
          options: [
            "Combination and Exothermic",
            "Decomposition and Endothermic",
            "Displacement and Endothermic",
            "Neutralization without heat change",
          ],
          correct_index: 0,
          marks: 2,
          explanation: "Quicklime reacts with water to produce slaked lime with a tremendous release of heat (combination & exothermic).",
        },
        {
          question: "Which of the following is an example of an Endothermic decomposition reaction?",
          options: [
            "Respiration",
            "Combustion of natural gas",
            "Decomposition of calcium carbonate into CaO and CO2 by heating",
            "Reaction of sodium with water",
          ],
          correct_index: 2,
          marks: 2,
          explanation: "Heating limestone (calcium carbonate) requires external thermal energy, making it endothermic.",
        },
        {
          question: "In the reaction: CuO + H2 -> Cu + H2O, which substance acts as the oxidizing agent?",
          options: ["H2", "CuO", "Cu", "H2O"],
          correct_index: 1,
          marks: 2,
          explanation: "CuO gives up oxygen and is reduced to Cu; hence, CuO is the oxidizing agent.",
        },
        {
          question: "What precipitate is formed when aqueous sodium sulphate reacts with aqueous barium chloride?",
          options: [
            "Sodium chloride (NaCl)",
            "Barium sulphate (BaSO4)",
            "Barium oxide (BaO)",
            "Sodium oxide (Na2O)",
          ],
          correct_index: 1,
          marks: 2,
          explanation: "A white precipitate of barium sulphate (BaSO4) is formed via double displacement.",
        },
        {
          question: "Why are chips packets flushed with nitrogen gas?",
          options: [
            "To increase sweetness",
            "To prevent oxidation (rancidity) of fats and oils",
            "To keep chips warm",
            "To absorb excess salt",
          ],
          correct_index: 1,
          marks: 2,
          explanation: "Nitrogen is an unreactive inert atmosphere that prevents oxidation of oils, keeping chips fresh.",
        },
      ],
    },
  });

  // Item D: 1 Assignment
  await upsertItem({
    type: "assignment",
    title: "Lab Practical: Observations on 4 Types of Reactions",
    access: "free",
    visibility: "batch",
    is_published: true,
    max_marks: 20,
    due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    body: {
      instructions: "Perform or review the 4 standard lab reactions: 1) Burning magnesium ribbon, 2) Heating ferrous sulphate crystals, 3) Iron nails in copper sulphate solution, and 4) Reaction of lead nitrate with potassium iodide. Write down balanced chemical equations and observed color changes. Submit your answers as text or upload a photo of your handwritten sheet.",
      max_marks: 20,
    },
  });

  // Item E: 1 Announcement
  await upsertItem({
    type: "announcement",
    title: "Welcome to Class 10 Science (Batch A)!",
    access: "free",
    visibility: "batch",
    is_published: true,
    max_marks: null,
    due_at: null,
    body: {
      content: "Hello students! Welcome to our classroom batch. All lecture summaries, practice quizzes, and lab assignments will be published here. Complete the Chemical Reactions notes before Wednesday's session!",
    },
  });

  // 5. Roster: Add student as 'joined' + 3 invited students
  console.log("Seeding student roster...");

  // Joined student
  await admin.from("roster").upsert({
    batch_id: batchId,
    student_id: studentId,
    status: "joined",
    joined_at: new Date().toISOString(),
  });

  // 3 Invited Students
  const invitedStudents = [
    { name: "Priya Sharma", email: "priya.sharma@example.com", phone: "+919811122233" },
    { name: "Rohan Verma", email: "rohan.verma@example.com", phone: "+919822233344" },
    { name: "Ananya Patel", email: "ananya.patel@example.com", phone: "+919833344455" },
  ];

  for (const inv of invitedStudents) {
    const { data: existingRoster } = await admin
      .from("roster")
      .select("id")
      .eq("batch_id", batchId)
      .eq("invited_email", inv.email)
      .maybeSingle();

    if (!existingRoster) {
      await admin.from("roster").insert({
        batch_id: batchId,
        student_id: null,
        status: "invited",
        invited_name: inv.name,
        invited_email: inv.email,
        invited_phone: inv.phone,
      });
    }
  }

  // 6. Fixed MCP Token for Demo Tutor
  console.log("Configuring fixed MCP token for demo tutor...");
  const { data: existingToken } = await admin
    .from("mcp_tokens")
    .select("id, token")
    .eq("token", demoMcpToken)
    .maybeSingle();

  if (existingToken) {
    await admin.from("mcp_tokens").update({
      tutor_id: tutorId,
      label: "Demo Claude MCP Token",
      is_revoked: false,
      last_used_at: new Date().toISOString(),
    }).eq("id", existingToken.id);
  } else {
    await admin.from("mcp_tokens").insert({
      tutor_id: tutorId,
      token: demoMcpToken,
      label: "Demo Claude MCP Token",
      is_revoked: false,
      last_used_at: new Date().toISOString(),
    });
  }

  const demoMcpUrl = `${appUrl}/api/c/${demoMcpToken}/mcp`;

  console.log("\n========================================================");
  console.log("🎉 CLASSY DEMO SEED COMPLETED SUCCESSFULLY!");
  console.log("========================================================");
  console.log("👤 Tutor Login:   tutor@classy.demo / Demo@1234");
  console.log("🎓 Student Login: student@classy.demo / Demo@1234");
  console.log("🔒 Security Ans:  demo (Question: 'What was the name of your first school?')");
  console.log("🏫 Batch:         Class 10 Science (Batch A) [Code: SCI10A, ₹299]");
  console.log("🤖 Stable MCP URL:");
  console.log(`   ${demoMcpUrl}`);
  console.log("========================================================\n");
}

seed().catch((err) => {
  console.error("❌ Seed failed with error:", err);
  process.exit(1);
});
