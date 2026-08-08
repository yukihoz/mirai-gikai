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
  id, bill_id, difficulty_level, content, created_at, updated_at
) VALUES 
(
  'a1111111-87c0-4de1-87c0-62b910fecf4d',
  '82333c65-6fbb-4de1-87c0-62b910fecf4d',
  'easy',
  '中央区では、歩きたばこも、決められた喫煙場所有外でたばこを吸うことも、条例で禁止されています。でも、破ってもお金を取られることはありません。となりの千代田区や渋谷区では、その場で2,000円を取られます。中央区も同じようにしたほうがいいのか、それとも別のやり方がいいのか。区に住む人、働く人、訪れる人の声を聞かせてください。たばこを吸う方の声も大歓迎です。',
  NOW(),
  NOW()
),
(
  'b2222222-87c0-4de1-87c0-62b910fecf4d',
  '82333c65-6fbb-4de1-87c0-62b910fecf4d',
  'normal',
  '中央区では「中央区歩行喫煙等の防止等に関する条例」により、区内全域での歩行喫煙および指定喫煙場所有外での喫煙が禁止されています。しかし現行条例には過料（過料罰）の規定がなく、罰則による強制力がありません。近隣の千代田区や渋谷区等では2,000円の過料を徴収する過料の現場徴収を実施しており、中央区内でも過料導入を求める声がある一方で、マナー啓発や喫煙場所の拡充を優先すべきとの意見もあります。今後の政策検討に向け、幅広いご意見を募集します。',
  NOW(),
  NOW()
),
(
  'c3333333-87c0-4de1-87c0-62b910fecf4d',
  '82333c65-6fbb-4de1-87c0-62b910fecf4d',
  'hard',
  '本意見募集トピックは「中央区歩行喫煙等の防止等に関する条例」の運用見直しおよび過料（行政罰）導入の是非に関するものです。中央区における歩行喫煙・ポイ捨て対策の実効性向上を目指し、義務違反者に対する2,000円の過料処分の導入、指導員の巡回体制強化、指定喫煙所の設置・整備のあり方について、区民・事業者・来訪者からの多角的なフィードバックを収集し、区議会および会派での政策提言に活用します。',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

INSERT INTO public.interview_configs (
  id, bill_id, status, system_prompt_template, overview_text, created_at, updated_at
) VALUES (
  '82333c65-6fbb-4de1-87c0-62b910fecf4d',
  '82333c65-6fbb-4de1-87c0-62b910fecf4d',
  'public',
  'あなたは中央区の歩きたばこ・路上喫煙対策に関する意見ヒアリングを行うAIインタビューアーです。相手の立場（区民、就業者、来訪者、喫煙者/非喫煙者）に配慮しながら、過料導入の是非やマナー向上策について深く意見を引き出してください。',
  '中央区の歩きたばこ・路上喫煙対策と「過料」導入の是非についてご意見をお聞かせください。',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  system_prompt_template = EXCLUDED.system_prompt_template,
  overview_text = EXCLUDED.overview_text,
  updated_at = NOW();
