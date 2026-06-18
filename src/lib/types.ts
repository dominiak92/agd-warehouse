// Typy domenowe odpowiadające schematowi Supabase (supabase/migrations/0001_init.sql)

export type ProductCategory =
  | "pralka"
  | "zmywarka"
  | "lodowka"
  | "piekarnik"
  | "suszarka"
  | "okap"
  | "mikrofalowka"
  | "plyta"
  | "ekspres"
  // RTV / audio
  | "telewizor"
  | "wzmacniacz"
  | "amplituner"
  | "deck"
  | "odtwarzacz_cd"
  | "zestaw_audio"
  | "gramofon"
  | "kolumny"
  | "bluray"
  | "vhs"
  | "minidisc"
  | "mini_wieza"
  | "laptop"
  | "radio"
  | "dvd"
  | "polskie_rtv"
  | "inne";

export type ProductStatus =
  | "w_magazynie"
  | "wystawione"
  | "zarezerwowane"
  | "sprzedane";

export type ProductCondition = "sprawny" | "niesprawny";

export type CurrencyCode = "EUR" | "PLN";

export interface Trip {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  sku: string | null;
  name: string;
  category: ProductCategory;
  brand: string | null;
  model: string | null;
  purchase_price: number | null;
  purchase_currency: CurrencyCode;
  exchange_rate: number | null;
  listing_price: number | null;
  sale_price: number | null;
  sale_date: string | null;
  status: ProductStatus;
  condition: ProductCondition | null;
  olx_url: string | null;
  purchase_date: string | null;
  purchase_location: string | null;
  trip_id: string | null;
  condition_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Produkt z dołączonymi danymi wyjazdu (join)
export interface ProductWithTrip extends Product {
  trips?: Pick<Trip, "id" | "date" | "location"> | null;
}

export interface UserSettings {
  user_id: string;
  default_exchange_rate: number;
  default_currency: CurrencyCode;
  created_at: string;
  updated_at: string;
}

// Dane wejściowe przy zapisie produktu (bez pól generowanych przez bazę)
export type ProductInput = Omit<
  Product,
  "id" | "user_id" | "sku" | "created_at" | "updated_at"
>;

export type TripInput = Omit<
  Trip,
  "id" | "user_id" | "created_at" | "updated_at"
>;
