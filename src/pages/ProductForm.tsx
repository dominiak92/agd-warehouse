import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CATEGORIES, BRANDS, STATUSES } from "@/lib/constants";
import {
  productFormSchema,
  toFormValues,
  toProductInput,
  type ProductFormValues,
} from "@/lib/productSchema";
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from "@/hooks/useProducts";
import { useNbpEurRate } from "@/hooks/useNbpRate";
import { fetchNbpEurRate } from "@/lib/nbp";
import { formatMoney } from "@/lib/currency";
import { TripPicker } from "@/components/products/TripPicker";

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: product, isLoading } = useProduct(id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(),
  });

  // Wczytaj dane przy edycji
  useEffect(() => {
    if (product) form.reset(toFormValues(product));
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  const currency = form.watch("purchase_currency");
  const purchasePrice = form.watch("purchase_price");
  const purchaseDate = form.watch("purchase_date");

  // Podgląd kursu NBP na żywo (gdy zakup w EUR i znana data)
  const nbpQuery = useNbpEurRate(
    currency === "EUR" && purchaseDate ? purchaseDate : undefined
  );
  const priceNum = Number(purchasePrice);
  const previewPln =
    currency === "EUR" && nbpQuery.data && !Number.isNaN(priceNum) && priceNum > 0
      ? priceNum * nbpQuery.data.rate
      : null;

  async function onSubmit(values: ProductFormValues) {
    const payload = toProductInput(values);

    // Kurs EUR→PLN z NBP na dzień zakupu (zapisywany przy produkcie)
    if (payload.purchase_currency === "EUR" && payload.purchase_date) {
      const nbp = await fetchNbpEurRate(payload.purchase_date);
      payload.exchange_rate = nbp?.rate ?? null;
      if (!nbp) {
        toast.warning(
          "Nie udało się pobrać kursu NBP — zapisuję bez przeliczenia na PLN."
        );
      }
    } else {
      payload.exchange_rate = null;
    }

    try {
      if (isEdit && id) {
        await updateProduct.mutateAsync({ id, changes: payload });
        toast.success("Zapisano zmiany");
        navigate(`/produkt/${id}`);
      } else {
        const created = await createProduct.mutateAsync(payload);
        toast.success(`Dodano produkt ${created.sku ?? ""}`.trim());
        navigate(`/produkt/${created.id}`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się zapisać produktu"
      );
    }
  }

  if (isEdit && isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  const saving = createProduct.isPending || updateProduct.isPending;

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

      <h1 className="text-2xl font-bold">
        {isEdit ? "Edytuj produkt" : "Nowy produkt"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Podstawowe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Podstawowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="np. Pralka Bosch Serie 6"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategoria</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marka</FormLabel>
                      <FormControl>
                        <Input
                          list="brand-suggestions"
                          placeholder="Bosch"
                          {...field}
                        />
                      </FormControl>
                      <datalist id="brand-suggestions">
                        {BRANDS.map((b) => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="WAU28T0PL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Zakup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zakup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cena zakupu</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          placeholder="0,00"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex shrink-0 overflow-hidden rounded-md border border-input">
                        {(["EUR", "PLN"] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              form.setValue("purchase_currency", c)
                            }
                            className={cn(
                              "px-3 text-sm font-medium transition-colors",
                              currency === c
                                ? "bg-primary text-primary-foreground"
                                : "bg-background text-muted-foreground hover:bg-secondary"
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    {currency === "EUR" && (
                      <FormDescription>
                        {nbpQuery.isFetching
                          ? "Pobieram kurs NBP…"
                          : previewPln !== null
                            ? `≈ ${formatMoney(previewPln, "PLN")} (kurs NBP ${nbpQuery.data?.rate} z ${nbpQuery.data?.effectiveDate})`
                            : "Przeliczenie na PLN wg kursu NBP z dnia zakupu (zapisywane automatycznie)."}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="purchase_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data zakupu</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchase_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miejsce zakupu</FormLabel>
                      <FormControl>
                        <Input placeholder="Berlin, sklep…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="trip_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wyjazd</FormLabel>
                    <FormControl>
                      <TripPicker
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Pogrupuj zakupy z jednego wyjazdu (opcjonalne).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sprzedaż */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sprzedaż</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="listing_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cena wystawienia (PLN)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          placeholder="0,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="olx_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link OLX</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://olx.pl/…"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cena sprzedaży (PLN)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          placeholder="0,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sale_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data sprzedaży</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Uwagi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stan / uwagi</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="condition_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Usterki, kompletność, klasa energetyczna…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Akcje — sticky na mobile dla wygody kciukiem */}
          <div className="sticky bottom-16 z-30 -mx-4 flex gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Zapisywanie…" : isEdit ? "Zapisz zmiany" : "Dodaj produkt"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Anuluj
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
