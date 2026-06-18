import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSaveSettings, useSettings } from "@/hooks/useSettings";
import { useProducts } from "@/hooks/useProducts";
import { DEFAULT_EXCHANGE_RATE } from "@/lib/constants";
import { downloadCsv, productsToCsv } from "@/lib/csv";
import type { CurrencyCode } from "@/lib/types";

export default function Settings() {
  const { data: settings } = useSettings();
  const saveSettings = useSaveSettings();
  const { data: products } = useProducts();

  const [rate, setRate] = useState(String(DEFAULT_EXCHANGE_RATE));
  const [currency, setCurrency] = useState<CurrencyCode>("EUR");

  useEffect(() => {
    if (settings) {
      setRate(String(settings.default_exchange_rate));
      setCurrency(settings.default_currency);
    }
  }, [settings]);

  async function handleSave() {
    const parsed = Number(rate);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast.error("Podaj poprawny kurs (liczba większa od 0).");
      return;
    }
    try {
      await saveSettings.mutateAsync({
        default_exchange_rate: parsed,
        default_currency: currency,
      });
      toast.success("Zapisano ustawienia");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się zapisać ustawień"
      );
    }
  }

  function handleExport() {
    if (!products || products.length === 0) {
      toast.error("Brak produktów do wyeksportowania.");
      return;
    }
    const csv = productsToCsv(products, Number(rate) || DEFAULT_EXCHANGE_RATE);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`amilo-magazyn-${stamp}.csv`, csv);
    toast.success("Wyeksportowano CSV");
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Ustawienia</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kurs i waluta</CardTitle>
          <CardDescription>
            Domyślny kurs EUR→PLN używany do przeliczeń, gdy produkt nie ma
            własnego kursu. Wpływa na zamrożony kapitał i zysk.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rate">Kurs EUR→PLN</Label>
              <Input
                id="rate"
                type="number"
                inputMode="decimal"
                step="0.0001"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Domyślna waluta zakupu</Label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as CurrencyCode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="PLN">PLN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saveSettings.isPending}>
            {saveSettings.isPending ? "Zapisywanie…" : "Zapisz"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Eksport danych</CardTitle>
          <CardDescription>
            Pobierz całą listę produktów jako plik CSV (do rozliczeń /
            księgowości).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" /> Eksportuj CSV
            {products ? ` (${products.length})` : ""}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
