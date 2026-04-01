-- Create new meeting_body_enum
CREATE TYPE public.meeting_body_enum AS ENUM (
  '定例会',
  '臨時会',
  '企画総務委員会',
  '区民文教委員会',
  '福祉保健委員会',
  '環境建設委員会',
  '築地等都市基盤対策特別委員会',
  '地域活性化対策特別委員会',
  '子ども子育て・高齢者対策特別委員会',
  '防災等安全対策特別委員会',
  '予算特別委員会',
  '決算特別委員会'
);

-- Add column to bills
ALTER TABLE public.bills ADD COLUMN meeting_body public.meeting_body_enum;

-- Migrate data (set everything to '定例会' for now)
UPDATE public.bills SET meeting_body = '定例会';

-- Set NOT NULL constraint
ALTER TABLE public.bills ALTER COLUMN meeting_body SET NOT NULL;

-- Recreate index
CREATE INDEX idx_bills_meeting_body ON public.bills(meeting_body);

-- Drop old columns and index
DROP INDEX IF EXISTS idx_bills_originating_house;
ALTER TABLE public.bills DROP COLUMN originating_house;

-- Assuming receiving_house doesn't exist on bills, but let's be safe
DO $$ 
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='bills' and column_name='receiving_house')
  THEN
      ALTER TABLE public.bills DROP COLUMN receiving_house;
  END IF;
END $$;

-- Drop old enum
DROP TYPE IF EXISTS public.house_enum CASCADE;

-- Add 'reported' to bill_status_enum
ALTER TYPE public.bill_status_enum ADD VALUE IF NOT EXISTS 'reported';
