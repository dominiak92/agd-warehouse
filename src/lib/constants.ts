import type {
  CurrencyCode,
  ProductCategory,
  ProductCondition,
  ProductStatus,
} from "@/lib/types";
import type { BadgeProps } from "@/components/ui/badge";

export const CATEGORIES: { value: ProductCategory; label: string }[] = [
  // AGD
  { value: "pralka", label: "Pralka" },
  { value: "zmywarka", label: "Zmywarka" },
  { value: "lodowka", label: "Lodówka" },
  { value: "piekarnik", label: "Piekarnik" },
  { value: "suszarka", label: "Suszarka" },
  { value: "okap", label: "Okap" },
  { value: "mikrofalowka", label: "Mikrofalówka" },
  { value: "plyta", label: "Płyta" },
  { value: "ekspres", label: "Ekspres" },
  // RTV / audio
  { value: "telewizor", label: "Telewizor" },
  { value: "wzmacniacz", label: "Wzmacniacz" },
  { value: "amplituner", label: "Amplituner" },
  { value: "deck", label: "Deck (magnetofon)" },
  { value: "odtwarzacz_cd", label: "Odtwarzacz CD" },
  { value: "zestaw_audio", label: "Zestawy audio" },
  { value: "gramofon", label: "Gramofon" },
  { value: "kolumny", label: "Kolumny" },
  { value: "bluray", label: "Blu-ray" },
  { value: "vhs", label: "VHS" },
  { value: "minidisc", label: "MiniDisc" },
  { value: "mini_wieza", label: "Mini wieża" },
  { value: "laptop", label: "Laptop" },
  { value: "radio", label: "Radio" },
  { value: "dvd", label: "DVD" },
  { value: "polskie_rtv", label: "Polskie RTV" },
  { value: "inne", label: "Inne" },
];

export const CONDITIONS: {
  value: ProductCondition;
  label: string;
  badge: NonNullable<BadgeProps["variant"]>;
}[] = [
  { value: "sprawny", label: "Sprawny", badge: "green" },
  { value: "niesprawny", label: "Niesprawny", badge: "orange" },
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
  // RTV / audio (zagraniczne)
  "Sony",
  "Philips",
  "JVC",
  "Pioneer",
  "Technics",
  "Denon",
  "Marantz",
  "Yamaha",
  "Onkyo",
  "Kenwood",
  "Akai",
  "Sansui",
  "Harman/Kardon",
  "NAD",
  "Rotel",
  "Sennheiser",
  "Bose",
  "JBL",
  "Sonab",
  "Thomson",
  "Loewe",
  "Telefunken",
  "Nordmende",
  "Saba",
  "Hitachi",
  "Sanyo",
  "Aiwa",
  "Dual",
  "Revox",
  "Bang & Olufsen",
  // Polskie marki audio / RTV (także starsze)
  "Unitra",
  "Diora",
  "Radmor",
  "Fonica",
  "Tonsil",
  "ZRK",
  "Eltra",
  "Kasprzak",
  "WZT",
  "Elemis",
  "Unimor",
  "Meratronik",
  "Diomedes",
  "Wilga",
  "Bambino",
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

export function conditionMeta(value: ProductCondition) {
  return (
    CONDITIONS.find((c) => c.value === value) ?? {
      value,
      label: value,
      badge: "slate" as const,
    }
  );
}
