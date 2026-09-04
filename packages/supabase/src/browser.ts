import { requirePublicEnv } from "@mirai-gikai/shared/env/require-public-env";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../types/supabase.types";

/**
 * ブラウザ環境用のSupabaseクライアントを作成
 * Client Componentsで使用
 */
export function createClient() {
  const vercelEnv = process.env.VERCEL_ENV;

  return createBrowserClient<Database>(
    requirePublicEnv({
      name: "NEXT_PUBLIC_SUPABASE_URL",
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      previewFallback: "https://preview-not-configured.invalid",
      vercelEnv,
    }),
    requirePublicEnv({
      name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      value: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      previewFallback: "preview-not-configured",
      vercelEnv,
    })
  );
}