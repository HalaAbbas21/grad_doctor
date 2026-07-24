import { Brain, Ear, Eye, HeartPulse, Scissors, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { consultTypeLabel } from "@/i18n/ar";
import type { ConsultationType } from "@/mock/types";

/** Icon + Arabic label for a consultation specialty — never color alone (§ accessibility rule). */
const CONSULT_TYPE_ICON: Record<ConsultationType, React.ReactNode> = {
  cardiac: <HeartPulse />,
  neurological: <Brain />,
  ophthalmic: <Eye />,
  ent: <Ear />,
  surgery: <Scissors />,
  other: <Sparkles />,
};

export function ConsultTypeBadge({ type }: { type: ConsultationType }) {
  return (
    <Badge variant="accent">
      {CONSULT_TYPE_ICON[type]}
      {consultTypeLabel[type]}
    </Badge>
  );
}
