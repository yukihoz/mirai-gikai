import { createClient } from "@supabase/supabase-js";

const URL = "https://deaqbabtvrdgzzbizyue.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlYXFiYWJ0dnJkZ3p6Yml6eXVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1MjQ2NiwiZXhwIjoyMDkwNTI4NDY2fQ.1Nx90QxaS38LI8nvB68CMl3AWlYH98qnYzv_r56r1yg";

const supabase = createClient(URL, KEY);

async function check() {
  console.log("Generating preview token in production Supabase...");
  const billId = "2deb7d5b-ae8f-4544-a724-7475e5305361";
  const token = "test_preview_token_2026";
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1 day later
  
  // 既存のトークンがあれば削除
  await supabase.from("preview_tokens").delete().eq("bill_id", billId).eq("token", token);
  
  const { error } = await supabase.from("preview_tokens").insert({
    bill_id: billId,
    token: token,
    expires_at: expiresAt
  });
  
  if (error) {
    console.error("Insert Error:", error.message);
    process.exit(1);
  }
  
  console.log("Preview URL:");
  console.log(`https://mirai-gikai.vercel.app/preview/bills/${billId}?token=${token}`);
  process.exit(0);
}

check();
