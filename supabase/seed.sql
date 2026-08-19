-- Demo data for the DanceHut MVP.
-- Run supabase/schema.sql first, then run this file in the Supabase SQL Editor.
-- Safe to run repeatedly: each event is matched by title and date.

insert into public.events (title, style, date, time, location, studio, host, price, spots, image, featured)
select * from (values
  (
    'Sunday Groove Lab', 'Hip-hop', date '2026-08-23', '5:30 PM', 'Koramangala',
    'The Movement House', 'Maya Joseph', '₹850', 8,
    'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=900', true
  ),
  (
    'Heels & Harmony', 'Heels', date '2026-08-29', '7:00 PM', 'Indiranagar',
    'Sway Studio', 'Rhea Kapoor', '₹1,200', 4,
    'https://images.pexels.com/photos/4667680/pexels-photo-4667680.jpeg?auto=compress&cs=tinysrgb&w=900', false
  ),
  (
    'Afro Beats Social', 'Afro', date '2026-08-30', '4:00 PM', 'HSR Layout',
    'Adaa Dance Co.', 'Kofi Mensah', '₹700', 12,
    'https://images.pexels.com/photos/1677710/pexels-photo-1677710.jpeg?auto=compress&cs=tinysrgb&w=900', false
  ),
  (
    'Contemporary Reset', 'Contemporary', date '2026-09-02', '6:30 PM', 'Whitefield',
    'The Attic Studio', 'Ishita Rao', '₹900', 10,
    'https://images.pexels.com/photos/3764150/pexels-photo-3764150.jpeg?auto=compress&cs=tinysrgb&w=900', false
  ),
  (
    'Bollywood Foundations', 'Bollywood', date '2026-09-05', '11:00 AM', 'Jayanagar',
    'StepUp Bengaluru', 'Ananya Mehta', '₹650', 15,
    'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=900', true
  ),
  (
    'Beginner Dance Flow', 'Freestyle', date '2026-09-06', '10:00 AM', 'Indiranagar',
    'Sway Studio', 'Dev Malhotra', '₹500', 0,
    'https://images.pexels.com/photos/4667680/pexels-photo-4667680.jpeg?auto=compress&cs=tinysrgb&w=900', false
  )
) as demo(title, style, date, time, location, studio, host, price, spots, image, featured)
where not exists (
  select 1 from public.events existing
  where existing.title = demo.title and existing.date = demo.date
);
