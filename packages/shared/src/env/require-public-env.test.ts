import { describe, expect, it, vi } from "vitest";
import { requirePublicEnv } from "./require-public-env";

const base = {
  name: "NEXT_PUBLIC_SUPABASE_URL",
  previewFallback: "https://preview-not-configured.invalid",
  warn: () => {},
};

describe("requirePublicEnv", () => {
  it("設定されていればその値を返す", () => {
    expect(
      requirePublicEnv({
        ...base,
        value: "https://example.supabase.co",
        vercelEnv: "production",
      })
    ).toBe("https://example.supabase.co");
  });

  it("本番で未設定なら落とす", () => {
    expect(() =>
      requirePublicEnv({ ...base, value: undefined, vercelEnv: "production" })
    ).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("ローカル（VERCEL_ENVなし）で未設定なら落とす", () => {
    // 手元の .env の設定漏れは、これまでどおり起動時に気づけるようにする
    expect(() =>
      requirePublicEnv({ ...base, value: undefined, vercelEnv: undefined })
    ).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("空文字も未設定として扱う", () => {
    expect(() =>
      requirePublicEnv({ ...base, value: "", vercelEnv: "production" })
    ).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("Previewで未設定ならビルドを通す", () => {
    expect(
      requirePublicEnv({ ...base, value: undefined, vercelEnv: "preview" })
    ).toBe("https://preview-not-configured.invalid");
  });

  it("Previewで読み替えたことを警告に残す", () => {
    const warn = vi.fn();
    requirePublicEnv({
      ...base,
      value: undefined,
      vercelEnv: "preview",
      warn,
    });

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("Previewでも設定されていれば本来の値を使う", () => {
    // supabase/ を触ったPRではワークフローがブランチ別に注入する
    expect(
      requirePublicEnv({
        ...base,
        value: "https://branch.supabase.co",
        vercelEnv: "preview",
      })
    ).toBe("https://branch.supabase.co");
  });
});
