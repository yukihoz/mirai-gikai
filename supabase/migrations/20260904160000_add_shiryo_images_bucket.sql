-- 報告資料の1ページ目を画像にして置くバケット。
--
-- ローカルでは手で作っていたため、本番・staging に作られないままだった。
-- 記事の取り込み（chuo-ingest）が画像の保存先として使う。
insert into storage.buckets (id, name, public)
values ('shiryo-images', 'shiryo-images', true)
on conflict (id) do nothing;

-- 記事に貼る画像なので誰でも読める。書き込みは secret key を持つ
-- 取り込みワーカーだけが行う（RLSはポリシーを持たない＝全拒否のまま）。
drop policy if exists "Public read shiryo images" on storage.objects;
create policy "Public read shiryo images"
  on storage.objects for select
  using (bucket_id = 'shiryo-images');
