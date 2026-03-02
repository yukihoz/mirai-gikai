import { after } from "next/server";
import { executePhase2 } from "@/features/topic-analysis/server/services/topic-analysis-orchestrator";
import {
  triggerNextPhase,
  verifyInternalAuth,
} from "@/features/topic-analysis/server/utils/trigger-next-phase";
import { registerNodeTelemetry } from "@/lib/telemetry/register";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    verifyInternalAuth(request);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const { versionId, billId } = (await request.json()) as {
    versionId: string;
    billId: string;
  };

  after(async () => {
    try {
      await registerNodeTelemetry();
      await executePhase2(versionId);
      await triggerNextPhase(3, versionId, billId);
    } catch (error) {
      console.error("[TopicAnalysis] Phase 2 failed:", error);
    }
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
