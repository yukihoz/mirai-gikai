/**
 * ローカルSupabaseから中央区データを取得して、
 * 本番Supabaseに投入するスクリプト
 */
import { createClient } from "@supabase/supabase-js";

// ローカル設定
const LOCAL_URL = "http://127.0.0.1:54421";
const LOCAL_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

// 本番設定
const PROD_URL = "https://deaqbabtvrdgzzbizyue.supabase.co";
const PROD_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlYXFiYWJ0dnJkZ3p6Yml6eXVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1MjQ2NiwiZXhwIjoyMDkwNTI4NDY2fQ.1Nx90QxaS38LI8nvB68CMl3AWlYH98qnYzv_r56r1yg";

const local = createClient(LOCAL_URL, LOCAL_KEY);
const prod = createClient(PROD_URL, PROD_KEY);

async function syncData() {
  console.log("🚀 Starting data sync: Local → Production\n");

  // 1. diet_sessions
  console.log("📋 Fetching diet_sessions from local...");
  const { data: sessions, error: sessionsErr } = await local
    .from("diet_sessions")
    .select("*");
  if (sessionsErr) throw new Error(`diet_sessions fetch error: ${sessionsErr.message}`);
  console.log(`  → Found ${sessions?.length} records`);

  // 2. tags
  console.log("📋 Fetching tags from local...");
  const { data: tags, error: tagsErr } = await local.from("tags").select("*");
  if (tagsErr) throw new Error(`tags fetch error: ${tagsErr.message}`);
  console.log(`  → Found ${tags?.length} records`);

  // 3. bills (status_order/publish_status_orderは生成カラムのため除外)
  console.log("📋 Fetching bills from local...");
  const { data: billsRaw, error: billsErr } = await local.from("bills").select("*");
  if (billsErr) throw new Error(`bills fetch error: ${billsErr.message}`);
  const bills = billsRaw?.map(({ status_order, publish_status_order, ...rest }: Record<string, unknown>) => rest);
  console.log(`  → Found ${bills?.length} records`);

  // 4. bill_contents
  console.log("📋 Fetching bill_contents from local...");
  const { data: contents, error: contentsErr } = await local
    .from("bill_contents")
    .select("*");
  if (contentsErr) throw new Error(`bill_contents fetch error: ${contentsErr.message}`);
  console.log(`  → Found ${contents?.length} records`);

  // 5. bills_tags
  console.log("📋 Fetching bills_tags from local...");
  const { data: billsTags, error: billsTagsErr } = await local
    .from("bills_tags")
    .select("*");
  if (billsTagsErr) throw new Error(`bills_tags fetch error: ${billsTagsErr.message}`);
  console.log(`  → Found ${billsTags?.length} records`);

  // 6. interview_configs
  console.log("📋 Fetching interview_configs from local...");
  const { data: iconfigs, error: iconfigsErr } = await local
    .from("interview_configs")
    .select("*");
  if (iconfigsErr) throw new Error(`interview_configs fetch error: ${iconfigsErr.message}`);
  console.log(`  → Found ${iconfigs?.length} records`);

  // 7. interview_questions
  console.log("📋 Fetching interview_questions from local...");
  const { data: iquestions, error: iquestionsErr } = await local
    .from("interview_questions")
    .select("*");
  if (iquestionsErr) throw new Error(`interview_questions fetch error: ${iquestionsErr.message}`);
  console.log(`  → Found ${iquestions?.length} records`);

  console.log("\n🗑️  Clearing production data...");

  // Clear production in reverse dependency order
  const tables = [
    "bills_tags",
    "bill_contents",
    "chat_usage_events",
    "bills",
    "diet_sessions",
    "tags",
    "interview_questions",
    "interview_configs",
  ] as const;

  for (const table of tables) {
    const { error } = await prod.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error && !error.message.includes("does not exist")) {
      console.log(`  ⚠️  ${table}: ${error.message}`);
    } else {
      console.log(`  ✅ Cleared ${table}`);
    }
  }

  console.log("\n📤 Inserting data to production...");

  // Insert in dependency order
  if (sessions && sessions.length > 0) {
    const { error } = await prod.from("diet_sessions").insert(sessions as never[]);
    if (error) throw new Error(`diet_sessions insert error: ${error.message}`);
    console.log(`  ✅ Inserted ${sessions.length} diet_sessions`);
  }

  if (tags && tags.length > 0) {
    const { error } = await prod.from("tags").insert(tags as never[]);
    if (error) throw new Error(`tags insert error: ${error.message}`);
    console.log(`  ✅ Inserted ${tags.length} tags`);
  }

  if (bills && bills.length > 0) {
    const { error } = await prod.from("bills").insert(bills as never[]);
    if (error) throw new Error(`bills insert error: ${error.message}`);
    console.log(`  ✅ Inserted ${bills.length} bills`);
  }

  if (iconfigs && iconfigs.length > 0) {
    const { error } = await prod.from("interview_configs").insert(iconfigs as never[]);
    if (error) throw new Error(`interview_configs insert error: ${error.message}`);
    console.log(`  ✅ Inserted ${iconfigs.length} interview_configs`);
  }

  if (iquestions && iquestions.length > 0) {
    const { error } = await prod.from("interview_questions").insert(iquestions as never[]);
    if (error) throw new Error(`interview_questions insert error: ${error.message}`);
    console.log(`  ✅ Inserted ${iquestions.length} interview_questions`);
  }

  if (contents && contents.length > 0) {
    // Insert in chunks to avoid payload limits
    const chunkSize = 50;
    for (let i = 0; i < contents.length; i += chunkSize) {
      const chunk = contents.slice(i, i + chunkSize);
      const { error } = await prod.from("bill_contents").insert(chunk as never[]);
      if (error) throw new Error(`bill_contents insert error (chunk ${i}): ${error.message}`);
    }
    console.log(`  ✅ Inserted ${contents.length} bill_contents`);
  }

  if (billsTags && billsTags.length > 0) {
    const { error } = await prod.from("bills_tags").insert(billsTags as never[]);
    if (error) throw new Error(`bills_tags insert error: ${error.message}`);
    console.log(`  ✅ Inserted ${billsTags.length} bills_tags`);
  }

  console.log("\n🎉 Sync complete!");
}

syncData().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
