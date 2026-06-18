import type {
  CurrencyCode,
  ProductCategory,
  ProductStatus,
} from "@/lib/types";
import type { BadgeProps } from "@/components/ui/badge";

export const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "pralka", label: "Pralka" },
  { value: "zmywarka", label: "Zmywarka" },
  { value: "lodowka", label: "Lodówka" },
  { value: "piekarnik", label: "Piekarnik" },
  { value: "suszarka", label: "Suszarka" },
  { value: "okap", label: "Okap" },
  { value: "mikrofalowka", label: "Mikrofalówka" },
  { value: "plyta", label: "Płyta" },
  { value: "ekspres", label: "Ekspres" },
  { value: "inne", label: "Inne" },
];

export const STATUSES: {
  value: ProductStatus;
  label: string;
  badge: NonNullable<BadgeProps["variant"]>;
}[] = [
  { value: "w_magazynie", label: "W magazynie", badge: "slate" },
  { value: "wystawione", label: "Wystawione", badge: "blue" },
  { value: "zarezerwowane", label: "Zarezerwowane", badge: "orange" },
  { value: "sprzedane", label: "Sprzedane", badge: "green" },
];

// Marki AGD — podpowiedzi (pole pozostaje wolnym tekstem). Premium i popularne.
export const BRANDS = [
  // Premium
  "Miele",
  "Bosch",
  "Siemens",
  "Gaggenau",
  "Neff",
  "AEG",
  "Liebherr",
  "Smeg",
  "V-ZUG",
  "Asko",
  "De Dietrich",
  // Średnia / popularne
  "Electrolux",
  "Whirlpool",
  "Samsung",
  "LG",
  "Panasonic",
  "Sharp",
  "Hotpoint",
  "Hotpoint-Ariston",
  "Indesit",
  "Zanussi",
  "Gorenje",
  "Hisense",
  "Haier",
  "Candy",
  "Beko",
  "Amica",
  "Toshiba",
  "Hoover",
  "Privileg",
  "Bauknecht",
  "Constructa",
  "Teka",
  "Franke",
  "Brandt",
  "Grundig",
  "Sauter",
  "Inne",
];

export const CURRENCIES: CurrencyCode[] = ["EUR", "PLN"];

export const DEFAULT_EXCHANGE_RATE = 4.3;

export function categoryLabel(value: ProductCategory): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function statusMeta(value: ProductStatus) {
  return (
    STATUSES.find((s) => s.value === value) ?? {
      value,
      label: value,
      badge: "slate" as const,
    }
  );
}
