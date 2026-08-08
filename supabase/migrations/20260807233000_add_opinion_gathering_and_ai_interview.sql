-- Add 'opinion_gathering' to bill_status_enum
ALTER TYPE public.bill_status_enum ADD VALUE IF NOT EXISTS 'opinion_gathering';

-- Add 'AIインタビュー' to meeting_body_enum
ALTER TYPE public.meeting_body_enum ADD VALUE IF NOT EXISTS 'AIインタビュー';
