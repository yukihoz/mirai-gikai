import { createClient } from "@supabase/supabase-js";

const URL = "https://deaqbabtvrdgzzbizyue.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlYXFiYWJ0dnJkZ3p6Yml6eXVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1MjQ2NiwiZXhwIjoyMDkwNTI4NDY2fQ.1Nx90QxaS38LI8nvB68CMl3AWlYH98qnYzv_r56r1yg";

const supabase = createClient(URL, KEY);

async function createAdmin() {
  const email = "yukihozumi@gmail.com";
  const password = "yukihozumi2026Admin"; // 仮パスワード

  console.log(`Creating admin user: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      provider: "email",
      roles: ["admin"]
    }
  });

  if (error) {
    console.error("Failed to create user:", error.message);
    process.exit(1);
  }

  console.log("Success! Admin user created:", data.user?.id);
  process.exit(0);
}

createAdmin();
