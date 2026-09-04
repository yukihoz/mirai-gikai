-- 委員会の会議録へのリンク。
--
-- 記事に載せているのはAIが書いた要約なので、読み手が一次情報に当たれる
-- 先として、中央区議会が公開している正式な会議録を指す。
-- URLは開催日と委員会名から組み立てる（kaigiroku.cgi/{年度}/{略称}{日付}.html）。
alter table chuo_bill_sources
  add column if not exists minutes_url text;

comment on column chuo_bill_sources.minutes_url is
  '中央区議会の正式な会議録ページのURL';
