-- Set is_featured = true for walking smoking topic to show at top of homepage in FeaturedBillSection
UPDATE public.bills
SET 
  is_featured = true,
  submitted_date = NOW() + INTERVAL '10 years',
  publish_status = 'published',
  updated_at = NOW()
WHERE id = '82333c65-6fbb-4de1-87c0-62b910fecf4d';
