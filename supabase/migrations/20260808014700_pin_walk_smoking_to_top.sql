-- Set submitted_date to latest timestamp so it appears at the very top of homepage
UPDATE public.bills
SET 
  submitted_date = NOW() + INTERVAL '10 years',
  publish_status = 'published',
  updated_at = NOW()
WHERE id = '82333c65-6fbb-4de1-87c0-62b910fecf4d';
