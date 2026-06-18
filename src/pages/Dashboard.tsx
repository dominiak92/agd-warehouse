import { useMemo, type ReactNode } from "react";
import {
  Boxes,
  Tag,
  Clock,
  CheckCircle2,
  Snowflake,
  TrendingUp,
  Store,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { useDefaultRate } from "@/hooks/useSettings";
import { calcProfit, formatMoney, purchasePricePln } from "@/lib/currency";

export default function Dashboard() {
  const { data: products, isLoading } = useProducts();
  const defaultRate = useDefaultRate();

  const m = useMemo(() => {
    const list = products ?? [];
    const byStatus = {
      w_magazynie: 0,
      wystawione: 0,
      zarezerwowane: 0,
      sprzedane: 0,
    };
    let frozenCapital = 0; // suma zakupu (PLN) niesprzedanych
    let profit = 0; // suma zysku ze sprzedanych
    let listedValue = 0; // suma cen wystawienia

    for (const p of list) {
      byStatus[p.status] += 1;
      if (p.status === "sprzedane") {
        profit += calcProfit(p, defaultRate).profit ?? 0;
      } else {
        frozenCapital += purchasePricePln(p, defaultRate) ?? 0;
      }
      if (p.status === "wystawione") {
        listedValue += p.listing_price ?? 0;
      }
    }
    return { total: list.length, byStatus, frozenCapital, profit, listedValue };
  }, [products, defaultRate]);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Podsumowanie</h1>

      {/* Liczniki statusów */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={<Boxes className="h-5 w-5" />}
          label="W magazynie"
          value={m.byStatus.w_magazynie}
        />
        <Stat
          icon={<Tag className="h-5 w-5" />}
          label="Wystawione"
          value={m.byStatus.wystawione}
        />
        <Stat
          icon={<Clock className="h-5 w-5" />}
          label="Zarezerwowane"
          value={m.byStatus.zarezerwowane}
        />
        <Stat
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Sprzedane"
          value={m.byStatus.sprzedane}
        />
      </div>

      {/* Wskaźniki finansowe */}
      <div className="grid gap-3 md:grid-cols-3">
        <Money
          icon={<Snowflake className="h-5 w-5 text-blue-400" />}
          label="Zamrożony kapitał"
          hint="Zakup niesprzedanego towaru (PLN)"
          value={formatMoney(m.frozenCapital, "PLN")}
        />
        <Money
          icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          label="Zysk ze sprzedanych"
          hint="Suma (sprzedaż − zakup) w PLN"
          value={formatMoney(m.profit, "PLN")}
          valueClass={m.profit >= 0 ? "text-emerald-400" : "text-destructive"}
        />
        <Money
          icon={<Store className="h-5 w-5 text-primary" />}
          label="Wartość wystawiona"
          hint="Suma cen wystawienia (PLN)"
          value={formatMoney(m.listedValue, "PLN")}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Przeliczenia EUR→PLN wg kursu z produktu lub kursu globalnego (
        {defaultRate}) z Ustawień.
      </p>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-md bg-secondary p-2 text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Money({
  icon,
  label,
  hint,
  value,
  valueClass,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </div>
        <p className={`text-2xl font-bold ${valueClass ?? ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
