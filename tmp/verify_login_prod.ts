import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load the .env.prod.local configuration
dotenv.config({ path: path.resolve(__dirname, "../.env.prod.local") });

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

console.log("Supabase URL:", url);
console.log("Supabase Secret Key is defined:", !!secretKey);

if (!url || !secretKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in env");
  process.exit(1);
}

const supabaseAdmin = createClient(url, secretKey);

async function testFetch() {
  console.log("Testing createAdminClient connectivity (fetching bills)...");
  const { data, error } = await supabaseAdmin.from("bills").select("id, name").limit(1);

  if (error) {
    console.error("Fetch failed:", error.message);
    process.exit(1);
  }

  console.log("Fetch successful! Data:", data);
  console.log("Admin Client Verification complete. All checks passed!");
  process.exit(0);
}

testFetch();
