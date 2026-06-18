import type { Product } from "@/lib/types";

const plnFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 2,
});

const eurFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

/** Formatuje kwotę w danej walucie (np. 1234.5 EUR -> "1234,50 €"). */
export function formatMoney(
  amount: number | null | undefined,
  currency: "EUR" | "PLN" = "PLN"
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }
  return currency === "EUR"
    ? eurFormatter.format(amount)
    : plnFormatter.format(amount);
}

/** Procent, np. 0.235 -> "23,5%". */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${(value * 100).toLocaleString("pl-PL", {
    maximumFractionDigits: 1,
  })}%`;
}

/**
 * Cena zakupu przeliczona na PLN.
 * Jeśli zakup był w EUR, użyj kursu z produktu, a w razie braku — kursu globalnego.
 * Zwraca null, gdy nie da się policzyć (brak ceny lub kursu dla EUR).
 */
export function purchasePricePln(
  product: Pick<Product, "purchase_price" | "purchase_currency" | "exchange_rate">,
  fallbackRate: number
): number | null {
  if (product.purchase_price === null || product.purchase_price === undefined) {
    return null;
  }
  if (product.purchase_currency === "PLN") {
    return product.purchase_price;
  }
  const rate = product.exchange_rate ?? fallbackRate;
  if (!rate || rate <= 0) return null;
  return product.purchase_price * rate;
}

export interface ProfitResult {
  profit: number | null; // zysk w PLN
  margin: number | null; // marża jako ułamek (0.2 = 20%)
}

/**
 * Zysk i marża sprzedanego produktu: sale_price (PLN) - cena zakupu (PLN).
 * Marża liczona względem ceny sprzedaży.
 */
export function calcProfit(
  product: Pick<
    Product,
    "purchase_price" | "purchase_currency" | "exchange_rate" | "sale_price"
  >,
  fallbackRate: number
): ProfitResult {
  const costPln = purchasePricePln(product, fallbackRate);
  if (
    product.sale_price === null ||
    product.sale_price === undefined ||
    costPln === null
  ) {
    return { profit: null, margin: null };
  }
  const profit = product.sale_price - costPln;
  const margin = product.sale_price > 0 ? profit / product.sale_price : null;
  return { profit, margin };
}
