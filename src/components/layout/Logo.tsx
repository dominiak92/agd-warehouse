import logoUrl from "@/lib/amilo-napis.png";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="AMILO AGD"
      className={cn("h-auto w-auto select-none", className)}
      draggable={false}
    />
  );
}
