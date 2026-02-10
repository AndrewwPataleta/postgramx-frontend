import { statusStyles, type StatusKey } from "./statusStyles";

interface StatusPillProps {
  icon: string;
  label: string;
  tone: StatusKey;
}

export default function StatusPill({ icon, label, tone }: StatusPillProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${statusStyles[tone]}`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
