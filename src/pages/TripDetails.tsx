import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/products/StatusBadge";
import { useDeleteTrip, useTrip, useTripProducts } from "@/hooks/useTrips";
import { formatMoney, purchasePricePln } from "@/lib/currency";

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: trip, isLoading } = useTrip(id);
  const { data: products } = useTripProducts(id);
  const deleteTrip = useDeleteTrip();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const total = useMemo(
    () =>
      products?.reduce(
        (sum, p) => sum + (purchasePricePln(p) ?? 0),
        0
      ) ?? 0,
    [products]
  );

  if (isLoading) return <Skeleton className="h-[400px] w-full" />;
  if (!trip) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Nie znaleziono wyjazdu.</p>
        <Button onClick={() => navigate("/wyjazdy")}>Wróć do wyjazdów</Button>
      </div>
    );
  }

  async function handleDelete() {
    try {
      await deleteTrip.mutateAsync(trip!.id);
      toast.success("Usunięto wyjazd (produkty pozostały bez przypisania)");
      navigate("/wyjazdy");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się usunąć wyjazdu"
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/wyjazdy")}
        className="text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Wyjazdy
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {new Date(trip.date).toLocaleDateString("pl-PL")}
          </h1>
          {trip.location && (
            <p className="text-muted-foreground">{trip.location}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
          title="Usuń wyjazd"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {trip.notes && (
        <p className="whitespace-pre-wrap rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
          {trip.notes}
        </p>
      )}

      {/* Podsumowanie */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-muted-foreground">Produkty</p>
            <p className="text-xl font-bold">{products?.length ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Wydane (PLN)</p>
            <p className="text-xl font-bold">{formatMoney(total, "PLN")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Produkty */}
      <div className="space-y-2">
        {products && products.length > 0 ? (
          products.map((p) => (
            <Card
              key={p.id}
              onClick={() => navigate(`/produkt/${p.id}`)}
              className="cursor-pointer transition-colors hover:border-primary/60"
            >
              <CardContent className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(p.purchase_price, p.purchase_currency)}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Brak produktów przypisanych do tego wyjazdu.
          </p>
        )}
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usunąć wyjazd?</DialogTitle>
            <DialogDescription>
              Produkty przypisane do tego wyjazdu nie zostaną usunięte —
              stracą jedynie przypisanie.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTrip.isPending}
            >
              {deleteTrip.isPending ? "Usuwanie…" : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
