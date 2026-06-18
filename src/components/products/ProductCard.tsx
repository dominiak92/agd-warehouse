import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/products/StatusBadge";
import { categoryLabel, conditionMeta } from "@/lib/constants";
import { formatMoney, purchasePricePln } from "@/lib/currency";
import type { ProductWithTrip } from "@/lib/types";

interface Props {
  product: ProductWithTrip;
  onToggleListed: (product: ProductWithTrip, listed: boolean) => void;
  toggleDisabledFor?: string | null;
}

export function ProductCard({
  product,
  onToggleListed,
  toggleDisabledFor,
}: Props) {
  const navigate = useNavigate();
  const pln = purchasePricePln(product);
  const isSold = product.status === "sprzedane";

  return (
    <Card
      onClick={() => navigate(`/produkt/${product.id}`)}
      className="cursor-pointer transition-colors hover:border-primary/60"
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">
              {product.name}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {[product.brand, product.model].filter(Boolean).join(" · ") ||
                categoryLabel(product.category)}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <StatusBadge status={product.status} />
            {product.condition && (
              <Badge variant={conditionMeta(product.condition).badge}>
                {conditionMeta(product.condition).label}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Zakup</p>
            <p className="font-medium">
              {formatMoney(product.purchase_price, product.purchase_currency)}
            </p>
            {product.purchase_currency === "EUR" && pln !== null && (
              <p className="text-xs text-muted-foreground">
                ≈ {formatMoney(pln, "PLN")}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Wystawienie</p>
            <p className="font-medium">
              {formatMoney(product.listing_price, "PLN")}
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-between border-t border-border pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-mono text-[11px] text-muted-foreground">
            {product.sku ?? "—"}
          </span>
          <div className="flex items-center gap-2">
            <Label
              htmlFor={`listed-${product.id}`}
              className="text-xs text-muted-foreground"
            >
              Wystawione
            </Label>
            <Switch
              id={`listed-${product.id}`}
              checked={product.status === "wystawione"}
              disabled={isSold || toggleDisabledFor === product.id}
              onCheckedChange={(v) => onToggleListed(product, v)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
