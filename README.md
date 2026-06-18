# AMILO AGD — magazyn używanego sprzętu AGD

Aplikacja CRUD do zarządzania magazynem używanego sprzętu AGD kupowanego w
Niemczech i sprzedawanego w Polsce (m.in. na OLX). Jeden użytkownik, ciemny
motyw, responsywna (mobile-first przy formularzach).

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS + shadcn/ui** — komponenty UI (`src/components/ui`), tylko dark mode
- **Supabase** — Postgres + Auth (e-mail/hasło), Row Level Security
- **TanStack Query** — cache i komunikacja z bazą (`src/hooks`)
- **React Router** — routing i chronione trasy
- **react-hook-form + zod** — formularze i walidacja
- **Netlify** — hosting (SPA)

## Funkcje

- **Magazyn** (`/`) — karty produktów, wyszukiwarka (nazwa/marka/model/SKU),
  filtry (status, kategoria, marka, waluta, zakres dat zakupu), sortowanie,
  szybki przełącznik „wystawione/niewystawione" z karty.
- **Produkt** — dodawanie/edycja (mobile-first), przełącznik waluty EUR/PLN,
  przypisanie do wyjazdu lub utworzenie nowego „w locie".
- **Szczegóły** — pełny widok, „Otwórz na OLX", „Oznacz jako sprzedane"
  (cena + data), zysk i marża, usuwanie.
- **Wyjazdy** (`/wyjazdy`) — lista wyjazdów z liczbą produktów i sumą wydatków;
  szczegóły wyjazdu z produktami i podsumowaniem.
- **Podsumowanie** (`/podsumowanie`) — liczniki statusów, zamrożony kapitał,
  zysk ze sprzedanych, wartość towaru wystawionego.
- **Ustawienia** (`/ustawienia`) — globalny kurs EUR→PLN, eksport całej listy do CSV.

## 1. Konfiguracja Supabase

### a) Schemat bazy
W panelu Supabase → **SQL Editor** → **New query** wklej całą zawartość pliku
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) i kliknij **Run**.
Utworzy to tabele `products`, `trips`, `user_settings`, enumy, triggery
(auto-SKU `AMILO-0001`, `updated_at`) oraz polityki **RLS**.

### b) Konto użytkownika (jednoosobowe)
Aplikacja nie ma ekranu rejestracji. Utwórz konto raz w panelu:
**Authentication → Users → Add user** (podaj e-mail i hasło; zaznacz
„Auto Confirm User"). Tym kontem logujesz się w aplikacji.

### c) Klucze API
**Project Settings → API** — skopiuj `Project URL` oraz `anon`/`publishable` key.

## 2. Zmienne środowiskowe

Vite eksponuje na froncie **tylko** zmienne z prefiksem `VITE_`. Skopiuj
[`.env.example`](.env.example) do `.env` i uzupełnij:

```
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=twoj-publishable-lub-anon-key
```

> Używaj wyłącznie klucza publicznego (anon/publishable) — **nigdy** `service_role`.

## 3. Uruchomienie lokalne

```bash
npm install
npm run dev
```
Aplikacja: http://localhost:5173

## 4. Deploy na Netlify

1. Wypchnij repo na GitHub.
2. Netlify → **Add new site → Import an existing project** → wybierz repo.
3. Ustawienia builda wczytają się z [`netlify.toml`](netlify.toml)
   (`npm run build`, publish `dist`, SPA-redirecty).
4. **Site configuration → Environment variables** — dodaj `VITE_SUPABASE_URL`
   i `VITE_SUPABASE_ANON_KEY` (zakres obejmujący **Builds**).
5. Deploy. Po dodaniu/zmianie zmiennych użyj **Trigger deploy → Clear cache and
   deploy site** (Vite wstrzykuje zmienne w trakcie builda, nie w runtime).
6. W Supabase → **Authentication → URL Configuration** dodaj adres produkcyjny
   Netlify oraz `http://localhost:5173` do **Site URL / Redirect URLs**.

## Przyjęte założenia

- **Jeden użytkownik** — brak UI rejestracji; konto zakładane w panelu Supabase.
  RLS i tak ogranicza dostęp do wierszy danego `user_id`.
- **`user_id` ustawiany automatycznie** przez bazę (`default auth.uid()`),
  więc front nie wysyła go ręcznie.
- **SKU** generowany globalną sekwencją w formacie `AMILO-0001` (jednoosobowa
  aplikacja → globalna sekwencja jest wystarczająca).
- **Przeliczenia EUR→PLN**: priorytet ma kurs zapisany przy produkcie
  (`exchange_rate`); gdy go brak — kurs globalny z Ustawień (domyślnie 4,30).
- **Zysk** = `sale_price (PLN) − cena zakupu (PLN)`; **marża** liczona względem
  ceny sprzedaży.
- **Zamrożony kapitał** = suma cen zakupu (w PLN) produktów niesprzedanych.
- **Szybki przełącznik** na karcie zmienia status `wystawione ⇄ w_magazynie`
  (zablokowany dla sprzedanych).
- **Usunięcie wyjazdu** nie usuwa produktów — tracą jedynie przypisanie
  (`trip_id` = NULL).
- **CSV** używa separatora `;` i BOM UTF-8 (poprawne polskie znaki w Excelu).
- **Ceny sprzedaży/wystawienia** trzymane w PLN (sprzedaż następuje w Polsce).

## Struktura

```
src/
  components/
    ui/          komponenty shadcn/ui
    layout/      AppLayout, Logo
    products/    ProductCard, StatusBadge, TripPicker, SellProductDialog
  contexts/      AuthContext
  hooks/         useProducts, useTrips, useSettings (TanStack Query)
  lib/           supabase, types, constants, currency, csv, productSchema, queryClient
  pages/         Login, Products, ProductForm, ProductDetails, Trips, TripDetails, Dashboard, Settings
supabase/
  migrations/    0001_init.sql
```
