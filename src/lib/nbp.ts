// Klient kursów NBP (tabela A). API jest publiczne i obsługuje CORS.
// Dla dni bez notowania (weekendy/święta) NBP zwraca 404 — cofamy się do
// najbliższego wcześniejszego dnia roboczego.

export interface NbpRate {
  rate: number; // kurs średni EUR->PLN
  effectiveDate: string; // data notowania (YYYY-MM-DD)
}

/** Pobiera kurs EUR z NBP na zadany dzień (lub najbliższy wcześniejszy roboczy). */
export async function fetchNbpEurRate(date: string): Promise<NbpRate | null> {
  const start = new Date(`${date}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;

  const d = new Date(start);
  // Próbujemy maksymalnie 8 dni wstecz (pokrywa długie weekendy/święta)
  for (let i = 0; i < 8; i++) {
    const iso = d.toISOString().slice(0, 10);
    try {
      const res = await fetch(
        `https://api.nbp.pl/api/exchangerates/rates/A/EUR/${iso}/?format=json`
      );
      if (res.ok) {
        const json = await res.json();
        const entry = json?.rates?.[0];
        if (entry && typeof entry.mid === "number") {
          return { rate: entry.mid, effectiveDate: entry.effectiveDate };
        }
      }
      // 404 = brak notowania w tym dniu -> cofamy się o dzień
    } catch {
      // błąd sieci -> przerywamy, brak kursu
      return null;
    }
    d.setDate(d.getDate() - 1);
  }
  return null;
}
