-- Public content is stored as keyed settings so new fields can be added without
-- a schema migration. Gallery metadata remains in gallery_images and binary
-- image data is kept in a private Storage bucket, served by the application.

INSERT INTO public.site_settings (key, value) VALUES
  ('company_name', 'Precise Industries'),
  ('company_tagline', 'Precision machining, grinding & die-mould components'),
  ('company_address', 'Gat No. 131, Shop No. 06, Ganesh Nagar, Talawade, Pune 411062'),
  ('mobile_number', '+91 9850710479'),
  ('email_address', 'preciseindustries9@gmail.com'),
  ('director_name', 'Prathamesh Sudam Bhase'),
  ('director_role', 'Director – Operations')
ON CONFLICT (key) DO NOTHING;

UPDATE public.site_settings
SET value = 'https://wa.me/919850710479', updated_at = now()
WHERE key = 'whatsapp_url' AND value = 'https://wa.me/917666400893';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
