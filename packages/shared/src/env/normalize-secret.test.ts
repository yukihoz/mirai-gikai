import { describe, expect, it } from "vitest";
import { normalizeSecret } from "./normalize-secret";

describe("normalizeSecret", () => {
  it("そのまま使える値は変えない", () => {
    expect(normalizeSecret("s3cr3t")).toBe("s3cr3t");
  });

  it("貼り付けで入った末尾の改行を落とす", () => {
    expect(normalizeSecret("s3cr3t\n")).toBe("s3cr3t");
    expect(normalizeSecret("s3cr3t\r\n")).toBe("s3cr3t");
  });

  it("前後の空白を落とす", () => {
    expect(normalizeSecret("  s3cr3t  ")).toBe("s3cr3t");
  });

  it("値の途中の空白は残す", () => {
    expect(normalizeSecret(" a b ")).toBe("a b");
  });

  it("未設定はそのまま未設定", () => {
    expect(normalizeSecret(undefined)).toBeUndefined();
  });

  it("空文字と空白だけの値は未設定として扱う", () => {
    // 空文字を返すと、秘密が無いのに比較が通る経路を作りかねない
    expect(normalizeSecret("")).toBeUndefined();
    expect(normalizeSecret("   \n")).toBeUndefined();
  });
});
