import { ImageResponse } from "next/og";
import { getMeetingOgData } from "@/features/meetings/server/loaders/get-meeting-og-data";
import {
  formatMeetingDate,
  parseMeetingDateParam,
} from "@/features/meetings/shared/utils/meeting-date";
import { loadOgFont, loadPublicImageDataUrl } from "@/lib/og/og-assets";

/**
 * 会議まとめページのOGP画像。
 *
 * その日にどの委員会が開かれ、何が報告されたかを画像だけで伝える。
 * SNSに貼ったときは本文よりも画像が先に読まれるため、日付・委員会名・
 * 報告資料の見出しをこの順で置く。
 */

/** 委員会名の文字数に応じた大きさ。長い特別委員会名でも1行に収める */
function committeeFontSize(committees: string): number {
  if (committees.length > 20) return 36;
  if (committees.length > 13) return 44;
  return 54;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  const date = dateParam === null ? null : parseMeetingDateParam(dateParam);
  if (date === null) {
    return new Response("Missing or invalid date parameter", { status: 400 });
  }

  let data: Awaited<ReturnType<typeof getMeetingOgData>>;
  try {
    data = await getMeetingOgData(date);
  } catch {
    return new Response("Internal server error", { status: 500 });
  }
  if (!data) {
    return new Response("Meeting not found", { status: 404 });
  }

  const [regularFont, boldFont, logoDataUrl] = await Promise.all([
    loadOgFont(400),
    loadOgFont(700),
    loadPublicImageDataUrl("img/logo.png"),
  ]);

  // フォント取得に失敗したらプロパティごと省き、既定のフォントに任せる
  const fonts = [
    regularFont && {
      name: "Noto Sans JP",
      data: regularFont,
      style: "normal" as const,
      weight: 400 as const,
    },
    boldFont && {
      name: "Noto Sans JP",
      data: boldFont,
      style: "normal" as const,
      weight: 700 as const,
    },
  ].filter((font) => font !== null);
  const fontOptions = fonts.length > 0 ? { fonts } : {};

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "linear-gradient(177deg, rgb(255, 253, 240) 0%, rgb(253, 246, 223) 100%)",
      }}
    >
      {/* グラデーションborder用ラッパー */}
      <div
        style={{
          display: "flex",
          width: 1140,
          height: 560,
          borderRadius: 30,
          backgroundImage:
            "linear-gradient(-30deg, rgb(255, 236, 147) 1%, rgb(246, 219, 94) 99%)",
          padding: 6,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            borderRadius: 24,
            padding: "44px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 400,
              color: "#666666",
            }}
          >
            {formatMeetingDate(date)}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 6,
              fontSize: committeeFontSize(data.committees),
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            {data.committees}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              paddingTop: 24,
              borderTop: "2px solid #f0ede6",
              flexDirection: "column",
              width: 830,
              flex: 1,
            }}
          >
            {data.titles.map((title) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 400,
                  color: "#404040",
                  lineHeight: 1.55,
                }}
              >
                ・{title}
              </div>
            ))}

            {data.restCount > 0 && (
              <div
                style={{
                  display: "flex",
                  marginTop: 10,
                  fontSize: 24,
                  fontWeight: 400,
                  color: "#8e8e93",
                }}
              >
                ほか{data.restCount}件の報告資料
              </div>
            )}
          </div>
        </div>

        {/* サイト名のバッジ */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 20px",
            borderBottomLeftRadius: 30,
            borderTopRightRadius: 30,
            backgroundImage:
              "linear-gradient(-30deg, rgb(255, 236, 147) 1%, rgb(246, 219, 94) 99%)",
          }}
        >
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#1f2937",
              letterSpacing: "0.03em",
            }}
          >
            みらい議会@中央区
          </span>
        </div>

        {/* ロゴ画像 */}
        {logoDataUrl && (
          // biome-ignore lint/performance/noImgElement: ignore
          <img
            alt="中央区みんなでアップデート"
            src={logoDataUrl}
            width={170}
            height={161}
            style={{
              position: "absolute",
              bottom: 28,
              right: 44,
            }}
          />
        )}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      ...fontOptions,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    }
  );
}
