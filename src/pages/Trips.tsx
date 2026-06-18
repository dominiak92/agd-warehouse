import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Truck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips } from "@/hooks/useTrips";
import { useProducts } from "@/hooks/useProducts";
import { formatMoney, purchasePricePln } from "@/lib/currency";

export default function Trips() {
  const navigate = useNavigate();
  const { data: trips, isLoading } = useTrips();
  const { data: products } = useProducts();

  // Agregacja per wyjazd: liczba produktów + suma zakupów w PLN
  const stats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    products?.forEach((p) => {
      if (!p.trip_id) return;
      const entry = map.get(p.trip_id) ?? { count: 0, total: 0 };
      entry.count += 1;
      entry.total += purchasePricePln(p) ?? 0;
      map.set(p.trip_id, entry);
    });
    return map;
  }, [products]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Wyjazdy</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !trips || trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <Truck className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Brak wyjazdów</p>
            <p className="text-sm text-muted-foreground">
              Wyjazd dodasz przy zapisywaniu produktu (pole „Wyjazd”).
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => {
            const s = stats.get(trip.id) ?? { count: 0, total: 0 };
            return (
              <Card
                key={trip.id}
                onClick={() => navigate(`/wyjazd/${trip.id}`)}
                className="cursor-pointer transition-colors hover:border-primary/60"
              >
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {new Date(trip.date).toLocaleDateString("pl-PL")}
                      {trip.location ? ` — ${trip.location}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {s.count} {s.count === 1 ? "produkt" : "produktów"} ·{" "}
                      {formatMoney(s.total, "PLN")}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
