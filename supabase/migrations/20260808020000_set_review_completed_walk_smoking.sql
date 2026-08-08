-- Set is_review_completed = true for walk smoking topic to hide "review in progress" banner
UPDATE public.bills
SET 
  is_review_completed = true,
  is_featured = true,
  submitted_date = NOW() + INTERVAL '10 years',
  publish_status = 'published',
  updated_at = NOW()
WHERE id = '82333c65-6fbb-4de1-87c0-62b910fecf4d';
