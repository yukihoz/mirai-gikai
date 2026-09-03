-- 中央区議会サイトの取り込み管理テーブル。
--
-- 目的は2つ。
--   1. いつ何を取り込んだかを残す（ingestion_runs）
--   2. 取得済みURLの内容ハッシュを持ち、中身が変わっていなければ
--      再取得も再生成もしない（ingestion_sources）
--
-- 2の効き方が大きい。委員会資料は一度公開されるとほぼ更新されないため、
-- 取り込みを繰り返してもハッシュが一致する限りAIを呼ばずに済む。
-- 相手サイトへのリクエストとAI費用の両方が減る。

create table chuo_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  -- calendar | committee | explain | discussions
  mode text not null,
  -- running | completed | failed
  status text not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  -- 取り込み件数・スキップ件数・生成件数など。形はモードごとに違う
  stats jsonb,
  -- この実行で使ったAI費用（USD）。Gatewayの実費を積み上げたもの。
  -- 費用が確認できなかった実行は null のままにし、0 とは区別する
  cost_usd numeric(10, 6),
  error text
);

comment on table chuo_ingestion_runs is
  '中央区議会サイトの取り込み実行ログ';
comment on column chuo_ingestion_runs.cost_usd is
  'この実行のAI費用（USD）。費用不明のときは 0 ではなく null';

create index idx_chuo_ingestion_runs_mode_started
  on chuo_ingestion_runs (mode, started_at desc);

alter table chuo_ingestion_runs enable row level security;

-- 取得済みURLの内容ハッシュ。変わっていなければ再取得・再解析をスキップする
create table chuo_ingestion_sources (
  id uuid primary key default gen_random_uuid(),
  -- calendar | committee | shiryo_pdf | minutes
  source text not null,
  url text not null,
  -- 取得内容のSHA-256（16進64文字）
  content_hash text,
  etag text,
  last_modified text,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, url)
);

comment on table chuo_ingestion_sources is
  '取得済みURLの内容ハッシュ。前回と同じなら再取得・再生成しない';

alter table chuo_ingestion_sources enable row level security;

create trigger update_chuo_ingestion_sources_updated_at
  before update on chuo_ingestion_sources
  for each row execute function update_updated_at_column();

-- 資料と議案（bills）の対応。
--
-- 同じ資料を二度取り込んでも議案が重複しないよう、資料PDFのURLを鍵にする。
-- bills 側に列を足さないのは、この対応が中央区版だけの都合であり、
-- 本家とマージするときに衝突させたくないため。
create table chuo_bill_sources (
  bill_id uuid primary key references bills (id) on delete cascade,
  -- 委員会の開会日程ページのURL
  meeting_url text not null,
  -- 資料PDFのURL。取り込みの突合キー
  shiryo_url text not null unique,
  -- 委員会ページ上の資料番号。議事録の「資料４」と対応する
  shiryo_number integer,
  -- 会議体名と開催日。議事録との突合に使う
  committee text not null,
  meeting_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table chuo_bill_sources is
  '議案が、どの委員会のどの資料から作られたかの対応';

create index idx_chuo_bill_sources_meeting
  on chuo_bill_sources (committee, meeting_date);

alter table chuo_bill_sources enable row level security;

create trigger update_chuo_bill_sources_updated_at
  before update on chuo_bill_sources
  for each row execute function update_updated_at_column();
