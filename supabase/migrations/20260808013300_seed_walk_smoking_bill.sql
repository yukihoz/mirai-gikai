-- Seed data for walking smoking opinion gathering bill and AI interview config
INSERT INTO public.bills (
  id, name, status, meeting_body, publish_status, submitted_date, created_at, updated_at
) VALUES (
  '82333c65-6fbb-4de1-87c0-62b910fecf4d',
  '中央区の歩きたばこ・路上喫煙 ルールのこれからを考える',
  'opinion_gathering',
  'AIインタビュー',
  'published',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  meeting_body = EXCLUDED.meeting_body,
  publish_status = EXCLUDED.publish_status,
  submitted_date = EXCLUDED.submitted_date,
  updated_at = NOW();

INSERT INTO public.bill_contents (
  id, bill_id, difficulty_level, title, summary, content, created_at, updated_at
) VALUES 
(
  'b2222222-87c0-4de1-87c0-62b910fecf4d',
  '82333c65-6fbb-4de1-87c0-62b910fecf4d',
  'normal',
  '中央区の歩きたばこ・路上喫煙対策と「過料」導入の是非',
  '中央区では「中央区歩行喫煙等の防止等に関する条例」により、区内全域での歩行喫煙および指定喫煙場所有外での喫煙が禁止されています。しかし現行条例には過料（過料罰）の規定がなく、罰則による強制力がありません。',
  '中央区では「中央区歩行喫煙等の防止等に関する条例」により、区内全域での歩行喫煙および指定喫煙場所有外での喫煙が禁止されています。しかし現行条例には過料（過料罰）の規定がなく、罰則による強制力がありません。近隣の千代田区や渋谷区等では2,000円の過料を徴収する過料の現場徴収を実施しており、中央区内でも過料導入を求める声がある一方で、マナー啓発や喫煙場所の拡充を優先すべきとの意見もあります。今後の政策検討に向け、幅広いご意見を募集します。',
  NOW(),
  NOW()
),
(
  'c3333333-87c0-4de1-87c0-62b910fecf4d',
  '82333c65-6fbb-4de1-87c0-62b910fecf4d',
  'hard',
  '中央区の歩きたばこ・路上喫煙対策と「過料」導入の是非',
  '本意見募集トピックは「中央区歩行喫煙等の防止等に関する条例」の運用見直しおよび過料（行政罰）導入の是非に関するものです。',
  '本意見募集トピックは「中央区歩行喫煙等の防止等に関する条例」の運用見直しおよび過料（行政罰）導入の是非に関するものです。中央区における歩行喫煙・ポイ捨て対策の実効性向上を目指し、義務違反者に対する2,000円の過料処分の導入、指導員の巡回体制強化、指定喫煙所の設置・整備のあり方について、区民・事業者・来訪者からの多角的なフィードバックを収集し、区議会および会派での政策提言に活用します。',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  updated_at = NOW();

INSERT INTO public.interview_configs (
  id, bill_id, name, status, created_at, updated_at
) VALUES (
  '82333c65-6fbb-4de1-87c0-62b910fecf4d',
  '82333c65-6fbb-4de1-87c0-62b910fecf4d',
  '中央区の歩きたばこ・路上喫煙対策と「過料」導入の是非',
  'public',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  updated_at = NOW();
