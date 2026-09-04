-- bills.meeting_body を enum から text にする。
--
-- 理由は2つ。
--
-- 1. 正式名称が enum に入らない
--    「区制施行８０周年等にぎわいの向上・創出対策特別委員会」は UTF-8 で78バイト。
--    PostgreSQL の enum ラベル上限は NAMEDATALEN-1 = 63バイトで、これは
--    コンパイル時定数のため設定では変えられない（変えるには PostgreSQL 自体の
--    再ビルドが必要で、マネージド環境では不可能）。
--
-- 2. 委員会の名前は数年ごとに変わる
--    中央区議会は2026年5月に特別委員会4つを組み替えている。そのたびに
--    `alter type ... add value` が要り、追加を忘れると取り込みが INSERT で
--    落ちる。会議体名は「区が決めた文字列」であって、アプリが列挙して
--    管理する値ではない。
--
-- 妥当な値かどうかは、これまでどおりアプリ側（zod スキーマ・admin の選択肢）で
-- 担保する。DB は文字列として受け取る。

alter table bills
  alter column meeting_body type text using meeting_body::text;

comment on column bills.meeting_body is
  '会議体名（区議会サイトの表記そのまま）。委員会は数年ごとに組み替えられるため text で持つ';

-- 縮めて入れていた名前を正式名称に戻す
update bills
set meeting_body = '区制施行８０周年等にぎわいの向上・創出対策特別委員会'
where meeting_body = '区制施行80周年等にぎわい創出対策特別委員会';

-- 列が enum でなくなったので型自体は不要になる。
-- ただし過去のマイグレーションが参照しているため、型は残したまま使わない。
