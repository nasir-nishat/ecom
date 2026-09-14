-- Dev seed. Runs after schema on `supabase db reset`. Do NOT run in production.
-- Replace these two placeholder products with the store's own first products when running prompts/setup/04-catalog.md.
insert into public.categories (slug, name) values
  ('apparel', 'Apparel'), ('accessories', 'Accessories')
on conflict (slug) do nothing;

insert into public.products (slug, title, description, sku, brand, price, compare_at_price, stock, images, attributes, faqs, category_id)
select
  'classic-tee-black', 'Classic Tee — Black', 'Heavyweight 220gsm cotton tee with a relaxed fit.', 'TEE-BLK-M', 'Agentic',
  29.00, 39.00, 25, '{}'::text[], '{"color":"black","size":"M","material":"cotton"}'::jsonb,
  '[{"question":"Does it shrink?","answer":"Pre-washed; expect under 2% shrinkage."}]'::jsonb,
  (select id from public.categories where slug = 'apparel')
union all select
  'canvas-tote', 'Canvas Tote', '16oz canvas tote with reinforced handles.', 'TOTE-NAT', 'Agentic',
  19.00, null::numeric, 0, '{}'::text[], '{"color":"natural","capacity":"15L"}'::jsonb, '[]'::jsonb,
  (select id from public.categories where slug = 'accessories')
on conflict (slug) do nothing;

-- Promote a user to admin after they sign up:
--   update public.profiles set is_admin = true where email = 'you@example.com';
