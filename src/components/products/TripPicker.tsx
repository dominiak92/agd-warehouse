import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTrip, useTrips } from "@/hooks/useTrips";

const NONE = "none";

function tripLabel(date: string, location: string | null) {
  const d = new Date(date).toLocaleDateString("pl-PL");
  return location ? `${d} — ${location}` : d;
}

export function TripPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { data: trips } = useTrips();
  const createTrip = useCreateTrip();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  async function handleCreate() {
    try {
      const trip = await createTrip.mutateAsync({
        date,
        location: location.trim() || null,
        notes: notes.trim() || null,
      });
      onChange(trip.id);
      toast.success("Dodano wyjazd");
      setOpen(false);
      setLocation("");
      setNotes("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się dodać wyjazdu"
      );
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Select
          value={value || NONE}
          onValueChange={(v) => onChange(v === NONE ? "" : v)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Brak" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Brak</SelectItem>
            {trips?.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {tripLabel(t.date, t.location)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          title="Nowy wyjazd"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nowy wyjazd</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="trip-date">Data</Label>
              <Input
                id="trip-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-loc">Miejsce / miasto</Label>
              <Input
                id="trip-loc"
                placeholder="np. Frankfurt"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-notes">Notatki</Label>
              <Textarea
                id="trip-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={createTrip.isPending}
            >
              {createTrip.isPending ? "Dodawanie…" : "Dodaj wyjazd"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
