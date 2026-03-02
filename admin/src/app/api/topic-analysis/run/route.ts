import { after } from "next/server";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { createVersion } from "@/features/topic-analysis/server/repositories/topic-analysis-repository";
import { triggerNextPhase } from "@/features/topic-analysis/server/utils/trigger-next-phase";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { billId } = body as { billId: string };

  if (!billId) {
    return new Response(JSON.stringify({ error: "billId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const version = await createVersion(billId);

    after(async () => {
      try {
        await triggerNextPhase(1, version.id, billId);
      } catch (error) {
        console.error("Failed to trigger phase 1:", error);
      }
    });

    return new Response(
      JSON.stringify({ success: true, versionId: version.id }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Topic analysis failed:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "解析に失敗しました",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
