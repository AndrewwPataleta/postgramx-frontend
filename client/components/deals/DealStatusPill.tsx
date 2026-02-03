import { cn } from "@/lib/utils";

const toneStyles = {
  primary: "bg-primary/20 text-primary",
  warning: "bg-warning/20 text-warning",
  info: "bg-accent/15 text-accent",
  success: "bg-success/20 text-success",
  neutral: "bg-muted text-muted-foreground",
  danger: "bg-destructive/20 text-destructive",
};

export type DealStatusTone = keyof typeof toneStyles;

interface DealStatusPillProps {
  label: string;
  tone: DealStatusTone;
  className?: string;
}

export default function DealStatusPill({ label, tone, className }: DealStatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneStyles[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
