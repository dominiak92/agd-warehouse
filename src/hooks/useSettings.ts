import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DEFAULT_EXCHANGE_RATE } from "@/lib/constants";
import type { CurrencyCode, UserSettings } from "@/lib/types";

const settingsKey = ["user_settings"] as const;

export function useSettings() {
  return useQuery({
    queryKey: settingsKey,
    queryFn: async (): Promise<UserSettings | null> => {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return (data as UserSettings) ?? null;
    },
  });
}

/** Wygodny dostęp do kursu domyślnego (z fallbackiem), gdy ustawienia jeszcze nie istnieją. */
export function useDefaultRate(): number {
  const { data } = useSettings();
  return data?.default_exchange_rate ?? DEFAULT_EXCHANGE_RATE;
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      default_exchange_rate: number;
      default_currency: CurrencyCode;
    }): Promise<UserSettings> => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Brak zalogowanego użytkownika.");

      const { data, error } = await supabase
        .from("user_settings")
        .upsert({ user_id: userId, ...values }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data as UserSettings;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKey });
    },
  });
}
