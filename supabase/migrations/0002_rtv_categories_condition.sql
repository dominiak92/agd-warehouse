-- =====================================================================
-- 0002 — Rozszerzenie o kategorie RTV/audio oraz stan techniczny
--        (sprawny / niesprawny).
-- Wklej całość w Supabase -> SQL Editor -> New query -> Run.
-- =====================================================================

-- ---------- Nowe kategorie RTV / audio ----------
-- ALTER TYPE ... ADD VALUE nie działa wewnątrz bloku transakcyjnego z innymi
-- poleceniami w starszych wersjach Postgresa, dlatego dodajemy pojedynczo,
-- idempotentnie (IF NOT EXISTS dostępne od Postgres 12+).
alter type product_category add value if not exists 'telewizor';
alter type product_category add value if not exists 'wzmacniacz';
alter type product_category add value if not exists 'amplituner';
alter type product_category add value if not exists 'deck';
alter type product_category add value if not exists 'odtwarzacz_cd';
alter type product_category add value if not exists 'zestaw_audio';
alter type product_category add value if not exists 'gramofon';
alter type product_category add value if not exists 'kolumny';
alter type product_category add value if not exists 'bluray';
alter type product_category add value if not exists 'vhs';
alter type product_category add value if not exists 'minidisc';
alter type product_category add value if not exists 'mini_wieza';
alter type product_category add value if not exists 'laptop';
alter type product_category add value if not exists 'radio';
alter type product_category add value if not exists 'dvd';
alter type product_category add value if not exists 'polskie_rtv';

-- ---------- Stan techniczny: sprawny / niesprawny ----------
do $$ begin
  create type product_condition as enum ('sprawny','niesprawny');
exception when duplicate_object then null; end $$;

alter table products
  add column if not exists condition product_condition;
