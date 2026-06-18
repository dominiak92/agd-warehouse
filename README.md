# AGD Warehouse

Aplikacja React (Vite + TypeScript) z shadcn/ui i autentykacją Supabase, gotowa do hostowania na Netlify.

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS + shadcn/ui** (komponenty w `src/components/ui`)
- **React Router** (logowanie / rejestracja / chroniony pulpit)
- **Supabase** (auth — `src/lib/supabase.ts`, `src/contexts/AuthContext.tsx`)

## Uruchomienie lokalne

```bash
npm install
cp .env.example .env   # i uzupełnij wartości (lub użyj gotowego .env)
npm run dev
```

Aplikacja: http://localhost:5173

## Zmienne środowiskowe

| Zmienna | Opis |
| --- | --- |
| `VITE_SUPABASE_URL` | URL projektu Supabase |
| `VITE_SUPABASE_ANON_KEY` | Publiczny (publishable/anon) klucz API |

> Vite eksponuje na froncie tylko zmienne z prefiksem `VITE_`.
> Nigdy nie używaj tu klucza `service_role`.

## Deploy na Netlify

1. Wypchnij repo na GitHub.
2. W Netlify: **Add new site → Import an existing project** → wybierz repo.
3. Build settings wczytają się z `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. W **Site settings → Environment variables** dodaj:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Przekierowania SPA obsługuje `netlify.toml`.

## Konfiguracja Supabase Auth

W panelu Supabase → **Authentication → URL Configuration** dodaj adres
produkcyjny Netlify (i `http://localhost:5173`) do **Site URL** / **Redirect URLs**.
Email confirmation możesz włączyć/wyłączyć w **Authentication → Providers → Email**.
