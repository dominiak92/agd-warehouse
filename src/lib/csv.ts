import type { ProductWithTrip } from "@/lib/types";
import { categoryLabel, statusMeta } from "@/lib/constants";
import { purchasePricePln, calcProfit } from "@/lib/currency";

const HEADERS = [
  "SKU",
  "Nazwa",
  "Kategoria",
  "Marka",
  "Model",
  "Cena zakupu",
  "Waluta",
  "Kurs",
  "Cena zakupu (PLN)",
  "Cena wystawienia (PLN)",
  "Cena sprzedaży (PLN)",
  "Zysk (PLN)",
  "Status",
  "Data zakupu",
  "Data sprzedaży",
  "Miejsce zakupu",
  "Link OLX",
  "Uwagi",
];

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[";\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Buduje CSV (separator ";", zgodny z polskim Excelem) z listy produktów. */
export function productsToCsv(
  products: ProductWithTrip[],
  fallbackRate: number
): string {
  const rows = products.map((p) => {
    const costPln = purchasePricePln(p, fallbackRate);
    const { profit } = calcProfit(p, fallbackRate);
    return [
      p.sku,
      p.name,
      categoryLabel(p.category),
      p.brand,
      p.model,
      p.purchase_price,
      p.purchase_currency,
      p.exchange_rate,
      costPln !== null ? costPln.toFixed(2) : "",
      p.listing_price,
      p.sale_price,
      profit !== null ? profit.toFixed(2) : "",
      statusMeta(p.status).label,
      p.purchase_date,
      p.sale_date,
      p.purchase_location,
      p.olx_url,
      p.condition_notes,
    ]
      .map(escapeCell)
      .join(";");
  });

  return [HEADERS.join(";"), ...rows].join("\n");
}

/** Pobiera CSV jako plik w przeglądarce. BOM dla poprawnych polskich znaków w Excelu. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
