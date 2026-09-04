-- 委員会での質疑。資料ごとに、どんな論点が議論されたかを持つ。
--
-- 発言そのものは保存しない。議員の発言の著作権は議員個人に帰属し、
-- ウェブ掲載の可否は学説が割れている（著作権法40条2項）。一方、情報解析
-- （30条の4）は自由で、AIが独自の表現で書いた要約は原文の表現を再現しない
-- 限り複製・翻案に当たらない。だから「要約だけを持つ」ことが設計になる。
--
-- 原文へは記事から中央区議会の会議録にリンクする。

create table chuo_discussions (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references bills (id) on delete cascade,
  -- 論点の並び順（モデルが返した順）
  display_order integer not null,
  -- 論点の見出し（例: なぜ「LoGoフォーム」を使うのか）
  title text not null,
  -- 質問の要約
  question text not null,
  -- 質問した委員の氏名。複数の委員が同じ論点を聞いていればまとめる
  questioners text[] not null,
  -- 区側の回答の要約
  answer text not null,
  -- 答弁した理事者（氏名と役職）
  answerers text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bill_id, display_order)
);

comment on table chuo_discussions is
  '委員会での質疑の要約。発言そのものは持たない（原文は区議会の会議録へリンク）';

create index idx_chuo_discussions_bill on chuo_discussions (bill_id);

alter table chuo_discussions enable row level security;

create trigger update_chuo_discussions_updated_at
  before update on chuo_discussions
  for each row execute function update_updated_at_column();

-- 議事録をどこまで取り込んだか。
--
-- 資料が公開されてから会議録が出るまで数か月あるため、記事は
-- 「質疑はまだ」→「質疑を追記した」と2段階で育つ。その状態を持つ。
alter table chuo_bill_sources
  add column discussions_linked_at timestamptz;

comment on column chuo_bill_sources.discussions_linked_at is
  '委員会での質疑を紐づけた日時。null なら会議録がまだ公開されていない';
