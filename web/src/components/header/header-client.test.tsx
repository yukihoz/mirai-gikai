// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderClient } from "./header-client";

const sendGAEventMock = vi.hoisted(() => vi.fn());
const usePathnameMock = vi.hoisted(() => vi.fn());

vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: sendGAEventMock,
}));
vi.mock("next/navigation", () => ({ usePathname: usePathnameMock }));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
// 初期値がスイッチまで届いているかを見たいので、受け取った値を描く
vi.mock(
  "@/features/bill-difficulty/client/components/difficulty-selector",
  () => ({
    DifficultySelector: ({ currentLevel }: { currentLevel: string }) => (
      <span data-testid="difficulty">{currentLevel}</span>
    ),
  })
);
vi.mock(
  "@/features/interview-session/client/components/interview-header-actions",
  () => ({
    InterviewHeaderActions: () => null,
  })
);
vi.mock("./hamburger-menu", () => ({ HamburgerMenu: () => null }));

beforeEach(() => {
  sendGAEventMock.mockClear();
  usePathnameMock.mockReturnValue("/");
  // biome-ignore lint/suspicious/noDocumentCookie: テストの前提としてCookieを直接用意する
  document.cookie = "bill_difficulty_level=; max-age=0; path=/";
});

describe("HeaderClient", () => {
  it("Cookieに保存された難易度をGAへ送る", () => {
    // biome-ignore lint/suspicious/noDocumentCookie: テストの前提としてCookieを直接用意する
    document.cookie = "bill_difficulty_level=hard; path=/";
    render(<HeaderClient />);

    expect(sendGAEventMock).toHaveBeenCalledWith("event", "difficulty_state", {
      level: "hard",
    });
  });

  it("Cookieが無ければ既定値を送る", () => {
    render(<HeaderClient />);

    expect(sendGAEventMock).toHaveBeenCalledWith("event", "difficulty_state", {
      level: "normal",
    });
  });

  it("Cookieに保存された難易度を切り替えスイッチの初期値にする", () => {
    // biome-ignore lint/suspicious/noDocumentCookie: テストの前提としてCookieを直接用意する
    document.cookie = "bill_difficulty_level=hard; path=/";
    render(<HeaderClient />);

    expect(screen.getByTestId("difficulty").textContent).toBe("hard");
  });

  it("Cookieが無ければスイッチは既定値", () => {
    render(<HeaderClient />);

    expect(screen.getByTestId("difficulty").textContent).toBe("normal");
  });

  it("pathnameが変わると再度GAへ送る", () => {
    const { rerender } = render(<HeaderClient />);
    expect(sendGAEventMock).toHaveBeenCalledTimes(1);

    usePathnameMock.mockReturnValue("/bills/1");
    rerender(<HeaderClient />);

    expect(sendGAEventMock).toHaveBeenCalledTimes(2);
  });
});
