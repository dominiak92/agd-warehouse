import { z } from "zod";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import type { Product, ProductInput } from "@/lib/types";

const categoryValues = CATEGORIES.map((c) => c.value) as [string, ...string[]];
const statusValues = STATUSES.map((s) => s.value) as [string, ...string[]];

// Wszystkie pola formularza to stringi (natywne inputy zwracają stringi).
// Konwersję na liczby/null robimy w toProductInput.
const numericString = z
  .string()
  .refine(
    (v) => v.trim() === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
    "Podaj poprawną liczbę (≥ 0)"
  );

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Nazwa jest wymagana"),
  category: z.enum(categoryValues),
  brand: z.string(),
  model: z.string(),
  purchase_price: numericString,
  purchase_currency: z.enum(["EUR", "PLN"]),
  listing_price: numericString,
  sale_price: numericString,
  sale_date: z.string(),
  status: z.enum(statusValues),
  olx_url: z
    .string()
    .refine(
      (v) => v.trim() === "" || /^https?:\/\/.+/.test(v.trim()),
      "Podaj poprawny adres URL (http/https)"
    ),
  purchase_date: z.string(),
  purchase_location: z.string(),
  trip_id: z.string(),
  condition_notes: z.string(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

/** Wartości startowe formularza na podstawie istniejącego produktu (edycja) lub puste (dodawanie). */
export function toFormValues(product?: Product): ProductFormValues {
  const str = (v: string | null | undefined) => v ?? "";
  const num = (v: number | null | undefined) =>
    v === null || v === undefined ? "" : String(v);
  return {
    name: str(product?.name),
    category: product?.category ?? "inne",
    brand: str(product?.brand),
    model: str(product?.model),
    purchase_price: num(product?.purchase_price),
    purchase_currency: product?.purchase_currency ?? "EUR",
    listing_price: num(product?.listing_price),
    sale_price: num(product?.sale_price),
    sale_date: str(product?.sale_date),
    status: product?.status ?? "w_magazynie",
    olx_url: str(product?.olx_url),
    purchase_date: product?.purchase_date ?? new Date().toISOString().slice(0, 10),
    purchase_location: str(product?.purchase_location),
    trip_id: str(product?.trip_id),
    condition_notes: str(product?.condition_notes),
  };
}

/** Mapuje zwalidowane dane formularza na payload do Supabase (puste -> null). */
export function toProductInput(values: ProductFormValues): ProductInput {
  const num = (v: string) => (v.trim() === "" ? null : Number(v));
  const str = (v: string) => (v.trim() === "" ? null : v.trim());
  return {
    name: values.name.trim(),
    category: values.category as ProductInput["category"],
    brand: str(values.brand),
    model: str(values.model),
    purchase_price: num(values.purchase_price),
    purchase_currency: values.purchase_currency,
    // Kurs EUR→PLN nie jest wpisywany ręcznie — uzupełniany z NBP przy zapisie.
    exchange_rate: null,
    listing_price: num(values.listing_price),
    sale_price: num(values.sale_price),
    sale_date: str(values.sale_date),
    status: values.status as ProductInput["status"],
    olx_url: str(values.olx_url),
    purchase_date: str(values.purchase_date),
    purchase_location: str(values.purchase_location),
    trip_id: str(values.trip_id),
    condition_notes: str(values.condition_notes),
  };
}
