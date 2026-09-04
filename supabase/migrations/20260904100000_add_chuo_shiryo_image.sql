-- 資料PDFの1ページ目を画像にしたもののURL。
--
-- 記事のタイトルと本文のあいだに、資料そのものを見せるために使う。
-- 画像はSupabase Storageに置き、PDF本体は保存しない（テキスト化して捨てる方針は変えない）。
alter table chuo_bill_sources
  add column shiryo_image_url text;

comment on column chuo_bill_sources.shiryo_image_url is
  '資料PDFの1ページ目を画像にしたもののURL（Storage）';

-- 画像の実寸。資料は縦長・横長どちらもあるため、表示側で比率を決め打ちできない。
alter table chuo_bill_sources
  add column shiryo_image_width integer,
  add column shiryo_image_height integer;
