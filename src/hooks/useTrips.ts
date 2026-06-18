import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Trip, TripInput, ProductWithTrip } from "@/lib/types";

export const tripKeys = {
  all: ["trips"] as const,
  list: () => [...tripKeys.all, "list"] as const,
  detail: (id: string) => [...tripKeys.all, "detail", id] as const,
  products: (id: string) => [...tripKeys.all, "products", id] as const,
};

export function useTrips() {
  return useQuery({
    queryKey: tripKeys.list(),
    queryFn: async (): Promise<Trip[]> => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Trip[];
    },
  });
}

export function useTrip(id: string | undefined) {
  return useQuery({
    queryKey: tripKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: async (): Promise<Trip> => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Trip;
    },
  });
}

export function useTripProducts(id: string | undefined) {
  return useQuery({
    queryKey: tripKeys.products(id ?? ""),
    enabled: !!id,
    queryFn: async (): Promise<ProductWithTrip[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*, trips(id, date, location)")
        .eq("trip_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductWithTrip[];
    },
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TripInput): Promise<Trip> => {
      const { data, error } = await supabase
        .from("trips")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Trip;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
