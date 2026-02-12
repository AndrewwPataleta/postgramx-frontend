import { useMemo } from "react";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { buildDualTimeLabel } from "@/shared/lib/time/timezone";

interface DualTimeLabelProps {
  dateIso?: string | null;
  display?: {
    local?: string | null;
    utc?: string | null;
  } | null;
  emptyLabel: string;
}

export default function DualTimeLabel({ dateIso, display, emptyLabel }: DualTimeLabelProps) {
  const { user } = useAuth();
  const userTimeZone = (user as { timeZone?: string | null } | null)?.timeZone ?? "UTC";

  const derived = useMemo(() => {
    if (!dateIso) return null;
    const dual = buildDualTimeLabel(dateIso, userTimeZone);
    if (!dual.localLabel || !dual.utcLabel) {
      return null;
    }
    return dual;
  }, [dateIso, userTimeZone]);

  const localLabel = display?.local ?? derived?.localLabel ?? null;
  const utcLabel = display?.utc ?? derived?.utcLabel ?? null;

  if (!localLabel) {
    return <span className="font-semibold text-foreground">{emptyLabel}</span>;
  }

  return (
    <span className="inline-flex flex-col leading-tight">
      <span className="font-semibold text-foreground">Your time: {localLabel}</span>
      <span className="text-[11px] text-muted-foreground">UTC: {utcLabel ?? ""}</span>
    </span>
  );
}
