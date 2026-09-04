import { ExternalLink } from "lucide-react";
import { getMeetingBodyColor } from "../../../shared/utils/meeting-body-colors";
import type { ChuoDiscussion } from "../../loaders/get-chuo-discussions";
import type { ChuoShiryo } from "../../loaders/get-chuo-shiryo";

interface ChuoDiscussionsProps {
  discussions: ChuoDiscussion[];
  shiryo: ChuoShiryo;
}

/**
 * 委員会でこの資料について交わされた質疑。
 *
 * 中央区の委員会は報告事項への質疑をまとめて行うため、ここに出るのは
 * 委員会全体のうち **この資料に関する部分だけ**。そのことを読み手に書いて
 * おかないと「この委員はこれしか聞いていない」と誤読される。
 *
 * 発言そのものは載せない。載せているのはAIが書いた要約で、原文は
 * 中央区議会の会議録にある。
 */
export function ChuoDiscussions({ discussions, shiryo }: ChuoDiscussionsProps) {
  if (discussions.length === 0) return null;

  const askers = new Set(discussions.flatMap((d) => d.questioners));
  const shiryoLabel =
    shiryo.shiryoNumber === null ? "この資料" : `資料${shiryo.shiryoNumber}`;
  const rail = getMeetingBodyColor(shiryo.committee).rail;

  return (
    <section aria-labelledby="chuo-discussions-heading">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
        <h2 id="chuo-discussions-heading" className="text-2xl font-bold">
          委員会での質疑
        </h2>
        <p className="text-xs text-mirai-text-muted">
          {shiryo.committee} ／ {askers.size}人の委員が質問
        </p>
      </div>

      <p className="rounded-md bg-mirai-surface-warm px-4 py-3 mb-3 text-sm leading-relaxed">
        この委員会では、複数の報告に対する質疑がまとめて行われました。ここでは
        {shiryoLabel}に関する部分だけを抜き出しています。
        （AIにより議事録から抜粋しています。誤りがある可能性がありますので
        発言内容の詳細は正式な議事録をご確認ください。）
      </p>

      <div className="space-y-3">
        {discussions.map((discussion) => (
          <article
            key={discussion.id}
            className="rounded-md bg-white px-4 py-5"
          >
            <h3 className="text-lg font-bold leading-snug mb-4">
              {discussion.title}
            </h3>

            <Turn
              label="議員の質問"
              names={discussion.questioners}
              nameSuffix="委員"
              body={discussion.question}
              rail={rail}
            />

            {discussion.answerers.length > 0 || discussion.answer ? (
              <div className="mt-4 pt-4 border-t border-mirai-border">
                <Turn
                  label="区の回答"
                  names={discussion.answerers}
                  body={discussion.answer}
                  rail="bg-mirai-border"
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-3 rounded-md bg-white px-4 py-4">
        {shiryo.minutesUrl === null ? null : (
          <a
            href={shiryo.minutesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mb-3 text-sm font-medium underline underline-offset-[3px] hover:opacity-70"
          >
            この日の会議録（正式版）を読む
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
          </a>
        )}
        <p className="text-xs leading-relaxed text-mirai-text-muted">
          この要約は、中央区議会の会議録をもとにAIが作成したものです。委員や
          理事者の発言そのものではありません。
        </p>
      </div>
    </section>
  );
}

/** 質問と回答の1往復 */
function Turn({
  label,
  names,
  nameSuffix = "",
  body,
  rail,
}: {
  /** この発言が質問か回答かを示す見出し */
  label: string;
  names: string[];
  nameSuffix?: string;
  body: string;
  /** 左に立てる縦線の色（Tailwindクラス） */
  rail: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`w-[3px] shrink-0 rounded-sm ${rail}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <span className="block mb-2 text-[10px] font-bold tracking-widest text-mirai-text-muted">
          {label}
        </span>
        {names.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {names.map((name) => (
              <span
                key={name}
                className="rounded-full bg-mirai-surface-tag px-3 py-1 text-sm font-bold text-mirai-text"
              >
                {name}
                {nameSuffix}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm leading-relaxed text-mirai-text-secondary">
          {body}
        </p>
      </div>
    </div>
  );
}
