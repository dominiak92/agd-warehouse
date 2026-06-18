import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/products/StatusBadge";
import { SellProductDialog } from "@/components/products/SellProductDialog";
import { useDeleteProduct, useProduct } from "@/hooks/useProducts";
import { useDefaultRate } from "@/hooks/useSettings";
import { categoryLabel } from "@/lib/constants";
import {
  calcProfit,
  formatMoney,
  formatPercent,
  purchasePricePln,
} from "@/lib/currency";

function formatDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("pl-PL") : "—";
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id);
  const deleteProduct = useDeleteProduct();
  const defaultRate = useDefaultRate();

  const [sellOpen, setSellOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-[500px] w-full" />;
  if (!product) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Nie znaleziono produktu.</p>
        <Button onClick={() => navigate("/")}>Wróć do magazynu</Button>
      </div>
    );
  }

  const costPln = purchasePricePln(product, defaultRate);
  const { profit, margin } = calcProfit(product, defaultRate);
  const isSold = product.status === "sprzedane";

  async function handleDelete() {
    try {
      await deleteProduct.mutateAsync(product!.id);
      toast.success("Usunięto produkt");
      navigate("/");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się usunąć produktu"
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Wstecz
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <StatusBadge status={product.status} />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {product.sku ?? "—"}
          </p>
        </div>
      </div>

      {/* Akcje */}
      <div className="flex flex-wrap gap-2">
        {!isSold && (
          <Button onClick={() => setSellOpen(true)}>
            <CheckCircle2 className="h-4 w-4" /> Oznacz jako sprzedane
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => navigate(`/produkt/${product.id}/edytuj`)}
        >
          <Pencil className="h-4 w-4" /> Edytuj
        </Button>
        {product.olx_url && (
          <Button variant="outline" asChild>
            <a href={product.olx_url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Otwórz na OLX
            </a>
          </Button>
        )}
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" /> Usuń
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dane produktu</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <Row label="Kategoria">{categoryLabel(product.category)}</Row>
          <Row label="Marka">{product.brand ?? "—"}</Row>
          <Row label="Model">{product.model ?? "—"}</Row>
          <Row label="Stan / uwagi">
            {product.condition_notes ? (
              <span className="whitespace-pre-wrap font-normal">
                {product.condition_notes}
              </span>
            ) : (
              "—"
            )}
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zakup</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <Row label="Cena zakupu">
            {formatMoney(product.purchase_price, product.purchase_currency)}
          </Row>
          {product.purchase_currency === "EUR" && (
            <>
              <Row label="Kurs EUR→PLN">
                {product.exchange_rate ?? `${defaultRate} (globalny)`}
              </Row>
              <Row label="Zakup w PLN">{formatMoney(costPln, "PLN")}</Row>
            </>
          )}
          <Row label="Data zakupu">{formatDate(product.purchase_date)}</Row>
          <Row label="Miejsce">{product.purchase_location ?? "—"}</Row>
          <Row label="Wyjazd">
            {product.trips ? (
              <button
                className="text-primary underline"
                onClick={() => navigate(`/wyjazd/${product.trips!.id}`)}
              >
                {formatDate(product.trips.date)}
                {product.trips.location ? ` — ${product.trips.location}` : ""}
              </button>
            ) : (
              "—"
            )}
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sprzedaż</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <Row label="Cena wystawienia">
            {formatMoney(product.listing_price, "PLN")}
          </Row>
          <Row label="Cena sprzedaży">
            {formatMoney(product.sale_price, "PLN")}
          </Row>
          <Row label="Data sprzedaży">{formatDate(product.sale_date)}</Row>
          {product.olx_url && (
            <Row label="OLX">
              <a
                href={product.olx_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Ogłoszenie
              </a>
            </Row>
          )}
          <Separator className="my-1" />
          <Row label="Zysk">
            <span
              className={
                profit === null
                  ? ""
                  : profit >= 0
                    ? "text-emerald-400"
                    : "text-destructive"
              }
            >
              {formatMoney(profit, "PLN")}
            </span>
          </Row>
          <Row label="Marża">{formatPercent(margin)}</Row>
        </CardContent>
      </Card>

      <SellProductDialog
        product={product}
        open={sellOpen}
        onOpenChange={setSellOpen}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usunąć produkt?</DialogTitle>
            <DialogDescription>
              Tej operacji nie można cofnąć. Produkt „{product.name}” zostanie
              trwale usunięty.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? "Usuwanie…" : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
