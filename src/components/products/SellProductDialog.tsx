import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateProduct } from "@/hooks/useProducts";
import type { Product } from "@/lib/types";

export function SellProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateProduct();
  const [price, setPrice] = useState(
    product.sale_price != null ? String(product.sale_price) : ""
  );
  const [date, setDate] = useState(
    product.sale_date ?? new Date().toISOString().slice(0, 10)
  );

  async function handleConfirm() {
    const parsed = price === "" ? null : Number(price);
    if (parsed === null || Number.isNaN(parsed) || parsed < 0) {
      toast.error("Podaj poprawną cenę sprzedaży.");
      return;
    }
    try {
      await update.mutateAsync({
        id: product.id,
        changes: {
          status: "sprzedane",
          sale_price: parsed,
          sale_date: date || null,
        },
      });
      toast.success("Oznaczono jako sprzedane");
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się zapisać sprzedaży"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Oznacz jako sprzedane</DialogTitle>
          <DialogDescription>{product.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sale-price">Cena sprzedaży (PLN)</Label>
            <Input
              id="sale-price"
              type="number"
              inputMode="decimal"
              step="0.01"
              autoFocus
              placeholder="0,00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sale-date">Data sprzedaży</Label>
            <Input
              id="sale-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleConfirm} disabled={update.isPending}>
            {update.isPending ? "Zapisywanie…" : "Potwierdź sprzedaż"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
