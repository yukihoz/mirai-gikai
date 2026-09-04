-- 2026年5月に設置された特別委員会4つを meeting_body_enum に追加する。
--
-- 中央区議会は2026年5月26日の臨時会で特別委員会を組み替えており、
-- 6月以降の委員会はこの4つで開かれている。enum に無いと取り込みが
-- INSERT で落ちるため、過去分の4委員会は残したまま追加する。
--
-- 旧: 築地等都市基盤対策 / 地域活性化対策 / 子ども子育て・高齢者対策 / 防災等安全対策
-- 新: 築地まちづくり・環境対策 / 区制施行80周年等にぎわいの向上・創出対策
--     / 子ども・教育環境整備対策 / 区民生活等安全・安心対策
--
-- 表示色は後継関係にあわせて引き継ぐ（web 側の meetingBodyColors）。

alter type meeting_body_enum add value if not exists '築地まちづくり・環境対策特別委員会';
-- 「区制施行８０周年等にぎわいの向上・創出対策特別委員会」は UTF-8 で78バイトあり、
-- PostgreSQL の enum ラベル上限（63バイト）を超えるため、そのままでは追加できない。
-- 表示用に縮めた名前を enum に入れ、区が使う正式名称は chuo_bill_sources.committee
-- （text）に残す。委員会名は数年ごとに変わるため、いずれ meeting_body は
-- enum ではなく text にするのが本筋。
alter type meeting_body_enum add value if not exists '区制施行80周年等にぎわい創出対策特別委員会';
alter type meeting_body_enum add value if not exists '子ども・教育環境整備対策特別委員会';
alter type meeting_body_enum add value if not exists '区民生活等安全・安心対策特別委員会';
