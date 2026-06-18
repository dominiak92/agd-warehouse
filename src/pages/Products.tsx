import { useMemo, useState } from "react";
import { ArrowDownUp, Check, PackageOpen, Search } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/products/ProductCard";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { STATUSES } from "@/lib/constants";
import { purchasePricePln } from "@/lib/currency";
import type { ProductStatus, ProductWithTrip } from "@/lib/types";

type SortKey =
  | "purchase_date_desc"
  | "purchase_date_asc"
  | "price_desc"
  | "price_asc"
  | "name_asc"
  | "status_asc"
  | "condition_asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "purchase_date_desc", label: "Data zakupu (najnowsze)" },
  { value: "purchase_date_asc", label: "Data zakupu (najstarsze)" },
  { value: "price_desc", label: "Cena (malejąco)" },
  { value: "price_asc", label: "Cena (rosnąco)" },
  { value: "name_asc", label: "Nazwa (A–Z)" },
  { value: "status_asc", label: "Status" },
  { value: "condition_asc", label: "Stan (sprawne najpierw)" },
];

const ALL = "all";

// Kolejność statusów do sortowania (cykl życia produktu)
const STATUS_ORDER = STATUSES.reduce<Record<string, number>>(
  (acc, s, i) => ({ ...acc, [s.value]: i }),
  {}
);

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const updateProduct = useUpdateProduct();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("purchase_date_desc");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products ? [...products] : [];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.name, p.brand, p.model, p.sku]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
      );
    }
    if (status !== ALL) list = list.filter((p) => p.status === status);

    list.sort((a, b) => {
      switch (sort) {
        case "name_asc":
          return a.name.localeCompare(b.name, "pl");
        case "status_asc":
          return (
            (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
          );
        case "condition_asc": {
          // Sprawne najpierw, brak stanu na końcu
          const rank = (c: string | null) =>
            c === "sprawny" ? 0 : c === "niesprawny" ? 1 : 2;
          return rank(a.condition) - rank(b.condition);
        }
        case "price_desc":
        case "price_asc": {
          const pa = purchasePricePln(a) ?? 0;
          const pb = purchasePricePln(b) ?? 0;
          return sort === "price_desc" ? pb - pa : pa - pb;
        }
        case "purchase_date_asc":
          return (a.purchase_date ?? "").localeCompare(b.purchase_date ?? "");
        case "purchase_date_desc":
        default:
          return (b.purchase_date ?? "").localeCompare(a.purchase_date ?? "");
      }
    });
    return list;
  }, [products, search, status, sort]);

  async function handleToggleListed(
    product: ProductWithTrip,
    listed: boolean
  ) {
    const newStatus: ProductStatus = listed ? "wystawione" : "w_magazynie";
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        changes: { status: newStatus },
      });
      toast.success(
        listed ? "Oznaczono jako wystawione" : "Wycofano z wystawienia"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się zmienić statusu"
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Magazyn</h1>
        <span className="text-sm text-muted-foreground">
          {filtered.length}
          {products && filtered.length !== products.length
            ? ` / ${products.length}`
            : ""}{" "}
          szt.
        </span>
      </div>

      {/* Wyszukiwarka + sortowanie */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Szukaj: nazwa, marka, model, SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Sheet open={sortOpen} onOpenChange={setSortOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ArrowDownUp className="h-4 w-4" />
              <span className="hidden sm:inline">Sortuj</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Sortuj produkty</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-1 pb-2">
              {SORT_OPTIONS.map((opt) => {
                const active = sort === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSort(opt.value);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-3 text-left text-sm transition-colors",
                      active
                        ? "bg-secondary font-medium text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60"
                    )}
                  >
                    {opt.label}
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Szybkie filtrowanie po statusie */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <StatusChip
          label="Wszystkie"
          active={status === ALL}
          onClick={() => setStatus(ALL)}
        />
        {STATUSES.map((s) => (
          <StatusChip
            key={s.value}
            label={s.label}
            active={status === s.value}
            onClick={() => setStatus(s.value)}
          />
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasProducts={!!products && products.length > 0} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onToggleListed={handleToggleListed}
              toggleDisabledFor={
                updateProduct.isPending ? updateProduct.variables?.id : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function EmptyState({ hasProducts }: { hasProducts: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <PackageOpen className="h-10 w-10 text-muted-foreground" />
      <div>
        <p className="font-medium">
          {hasProducts ? "Brak wyników" : "Brak produktów"}
        </p>
        <p className="text-sm text-muted-foreground">
          {hasProducts
            ? "Zmień kryteria wyszukiwania lub sortowanie."
            : "Dodaj pierwszy produkt przyciskiem „Dodaj produkt”."}
        </p>
      </div>
    </div>
  );
}
