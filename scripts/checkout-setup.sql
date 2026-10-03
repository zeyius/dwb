-- Checkout setup for delivery_rates. Safe to re-run.
-- Run in Supabase → SQL Editor.
begin;

-- 1. The checkout page reads rates with the public (anon) key to show prices.
--    Orders are only ever touched by /api with the service role key, so they
--    need no public policy at all (keep RLS on and no anon policies there).
alter table public.delivery_rates enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'delivery_rates' and policyname = 'Delivery rates are public'
  ) then
    create policy "Delivery rates are public" on public.delivery_rates
      for select to anon, authenticated using (true);
  end if;
end $$;

-- 2. One row per wilaya, codes 1-58 (same codes as supabase/functions/_shared/algeria.json),
--    for any wilaya that doesn't have one yet. Prices start NULL, which the
--    checkout treats as "not offered". Existing rows are left alone. Then e.g.:
--      update delivery_rates set home_price = 600, desk_price = 400 where wilaya_code = 16;
--    Home only / desk only: leave the other price NULL.
insert into public.delivery_rates (wilaya_code, wilaya_name)
select v.code, v.name
from (values
  (1, 'Adrar'),
  (2, 'Chlef'),
  (3, 'Laghouat'),
  (4, 'Oum El Bouaghi'),
  (5, 'Batna'),
  (6, 'Bejaia'),
  (7, 'Biskra'),
  (8, 'Bechar'),
  (9, 'Blida'),
  (10, 'Bouira'),
  (11, 'Tamanrasset'),
  (12, 'Tebessa'),
  (13, 'Tlemcen'),
  (14, 'Tiaret'),
  (15, 'Tizi Ouzou'),
  (16, 'Alger'),
  (17, 'Djelfa'),
  (18, 'Jijel'),
  (19, 'Setif'),
  (20, 'Saida'),
  (21, 'Skikda'),
  (22, 'Sidi Bel Abbes'),
  (23, 'Annaba'),
  (24, 'Guelma'),
  (25, 'Constantine'),
  (26, 'Medea'),
  (27, 'Mostaganem'),
  (28, 'M''Sila'),
  (29, 'Mascara'),
  (30, 'Ouargla'),
  (31, 'Oran'),
  (32, 'El Bayadh'),
  (33, 'Illizi'),
  (34, 'Bordj Bou Arreridj'),
  (35, 'Boumerdes'),
  (36, 'El Tarf'),
  (37, 'Tindouf'),
  (38, 'Tissemsilt'),
  (39, 'El Oued'),
  (40, 'Khenchela'),
  (41, 'Souk Ahras'),
  (42, 'Tipaza'),
  (43, 'Mila'),
  (44, 'Ain Defla'),
  (45, 'Naama'),
  (46, 'Ain Temouchent'),
  (47, 'Ghardaia'),
  (48, 'Relizane'),
  (49, 'Timimoun'),
  (50, 'Bordj Badji Mokhtar'),
  (51, 'Ouled Djellal'),
  (52, 'Beni Abbes'),
  (53, 'In Salah'),
  (54, 'In Guezzam'),
  (55, 'Touggourt'),
  (56, 'Djanet'),
  (57, 'El M''Ghair'),
  (58, 'El Meniaa')
) as v(code, name)
where not exists (select 1 from public.delivery_rates r where r.wilaya_code = v.code);

commit;
