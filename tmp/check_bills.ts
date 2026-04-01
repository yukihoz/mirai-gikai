import { createAdminClient } from "@mirai-gikai/supabase";

async function checkBills() {
  const supabase = createAdminClient();
  const titles = [
    "情報通信技術を利用した手続等に関する整備について",
    "公示送達のデジタル化について"
  ];

  console.log("Checking bills...");

  for (const title of titles) {
    const { data: bills, error } = await supabase
      .from("bills")
      .select(`
        id,
        name,
        publish_status,
        is_featured,
        diet_session_id,
        bill_contents (
          title,
          difficulty_level
        )
      `)
      .or(`name.ilike.%${title}%,bill_contents.title.ilike.%${title}%`);

    if (error) {
      console.error(`Error fetching bill "${title}":`, error);
      continue;
    }

    if (!bills || bills.length === 0) {
      console.log(`No bills found matching "${title}"`);
      continue;
    }

    console.log(`\nFound ${bills.length} bills for "${title}":`);
    bills.forEach(bill => {
      console.log(`- ID: ${bill.id}`);
      console.log(`  Name: ${bill.name}`);
      console.log(`  Status: ${bill.publish_status}`);
      console.log(`  Featured: ${bill.is_featured}`);
      console.log(`  Session ID: ${bill.diet_session_id}`);
      console.log(`  Contents:`, bill.bill_contents);
    });
  }
}

checkBills().catch(console.error);
