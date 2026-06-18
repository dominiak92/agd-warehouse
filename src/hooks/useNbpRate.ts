import { useQuery } from "@tanstack/react-query";
import { fetchNbpEurRate } from "@/lib/nbp";

/** Kurs EUR z NBP na zadany dzień (cache na czas sesji — kursy historyczne są stałe). */
export function useNbpEurRate(date: string | undefined) {
  return useQuery({
    queryKey: ["nbp", "EUR", date],
    enabled: !!date,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 0,
    queryFn: () => fetchNbpEurRate(date!),
  });
}
