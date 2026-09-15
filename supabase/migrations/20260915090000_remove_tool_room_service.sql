-- Keep previously deployed databases aligned with the current company tagline.
UPDATE public.site_settings
SET value = 'Precision machining, grinding & die-mould components',
    updated_at = now()
WHERE key = 'company_tagline';
