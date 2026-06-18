import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, PackageOpen } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/products/ProductCard";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import { purchasePricePln } from "@/lib/currency";
import type { ProductStatus, ProductWithTrip } from "@/lib/types";

type SortKey =
  | "purchase_date_desc"
  | "purchase_date_asc"
  | "price_desc"
  | "price_asc"
  | "name_asc";

const ALL = "all";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const updateProduct = useUpdateProduct();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [brand, setBrand] = useState<string>(ALL);
  const [currency, setCurrency] = useState<string>(ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<SortKey>("purchase_date_desc");
  const [showFilters, setShowFilters] = useState(false);

  // Marki obecne w danych (do filtra)
  const brands = useMemo(() => {
    const set = new Set<string>();
    products?.forEach((p) => p.brand && set.add(p.brand));
    return Array.from(set).sort();
  }, [products]);

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
    if (category !== ALL) list = list.filter((p) => p.category === category);
    if (brand !== ALL) list = list.filter((p) => p.brand === brand);
    if (currency !== ALL)
      list = list.filter((p) => p.purchase_currency === currency);
    if (dateFrom) list = list.filter((p) => (p.purchase_date ?? "") >= dateFrom);
    if (dateTo) list = list.filter((p) => (p.purchase_date ?? "") <= dateTo);

    list.sort((a, b) => {
      switch (sort) {
        case "name_asc":
          return a.name.localeCompare(b.name, "pl");
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
  }, [
    products,
    search,
    status,
    category,
    brand,
    currency,
    dateFrom,
    dateTo,
    sort,
  ]);

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

      {/* Wyszukiwarka */}
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
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters((s) => !s)}
          title="Więcej filtrów"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
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

      {/* Filtry zaawansowane */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-3 lg:grid-cols-5">
          <FilterSelect
            label="Kategoria"
            value={category}
            onChange={setCategory}
            options={CATEGORIES.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
          />
          <FilterSelect
            label="Marka"
            value={brand}
            onChange={setBrand}
            options={brands.map((b) => ({ value: b, label: b }))}
          />
          <FilterSelect
            label="Waluta"
            value={currency}
            onChange={setCurrency}
            options={[
              { value: "EUR", label: "EUR" },
              { value: "PLN", label: "PLN" },
            ]}
          />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Zakup od</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Zakup do</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Sortowanie */}
      <div className="flex items-center justify-end gap-2">
        <Label className="text-xs text-muted-foreground">Sortuj</Label>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-9 w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="purchase_date_desc">
              Data zakupu (najnowsze)
            </SelectItem>
            <SelectItem value="purchase_date_asc">
              Data zakupu (najstarsze)
            </SelectItem>
            <SelectItem value="price_desc">Cena (malejąco)</SelectItem>
            <SelectItem value="price_asc">Cena (rosnąco)</SelectItem>
            <SelectItem value="name_asc">Nazwa (A–Z)</SelectItem>
          </SelectContent>
        </Select>
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
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
            ? "Zmień kryteria wyszukiwania lub filtry."
            : "Dodaj pierwszy produkt przyciskiem „Dodaj produkt”."}
        </p>
      </div>
    </div>
  );
}
