import { createClient } from "@supabase/supabase-js";

const URL = "https://deaqbabtvrdgzzbizyue.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlYXFiYWJ0dnJkZ3p6Yml6eXVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1MjQ2NiwiZXhwIjoyMDkwNTI4NDY2fQ.1Nx90QxaS38LI8nvB68CMl3AWlYH98qnYzv_r56r1yg";

const supabase = createClient(URL, KEY);

async function check() {
  console.log("Checking production users with email...");
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Auth Admin Error:", error.message);
    process.exit(1);
  }
  
  const emailUsers = users.filter(u => u.email);
  console.log(`Total users found: ${users.length}, Users with email: ${emailUsers.length}`);
  
  emailUsers.forEach(u => {
    console.log(`Email: ${u.email}`);
    console.log(`  Provider: ${u.app_metadata?.provider}`);
    console.log(`  Roles: ${JSON.stringify(u.app_metadata?.roles)}`);
    console.log(`  Created At: ${u.created_at}`);
  });
  
  process.exit(0);
}

check();
