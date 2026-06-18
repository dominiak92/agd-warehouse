import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Product,
  ProductInput,
  ProductStatus,
  ProductWithTrip,
} from "@/lib/types";

const SELECT_WITH_TRIP = "*, trips(id, date, location)";

export const productKeys = {
  all: ["products"] as const,
  list: () => [...productKeys.all, "list"] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: async (): Promise<ProductWithTrip[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(SELECT_WITH_TRIP)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductWithTrip[];
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: async (): Promise<ProductWithTrip> => {
      const { data, error } = await supabase
        .from("products")
        .select(SELECT_WITH_TRIP)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as ProductWithTrip;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput): Promise<Product> => {
      const { data, error } = await supabase
        .from("products")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<ProductInput>;
    }): Promise<Product> => {
      const { data, error } = await supabase
        .from("products")
        .update(changes)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      qc.invalidateQueries({ queryKey: productKeys.detail(data.id) });
    },
  });
}

export function useUpdateProductStatus() {
  const update = useUpdateProduct();
  return {
    ...update,
    setStatus: (id: string, status: ProductStatus) =>
      update.mutateAsync({ id, changes: { status } }),
  };
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
