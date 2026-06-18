import { Badge } from "@/components/ui/badge";
import { statusMeta } from "@/lib/constants";
import type { ProductStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ProductStatus }) {
  const meta = statusMeta(status);
  return <Badge variant={meta.badge}>{meta.label}</Badge>;
}
