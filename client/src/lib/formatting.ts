import { STATUS_LABELS } from "@/constants/ui";

const ACRONYMS = new Set(["API", "ID", "TON", "USD"]);

export const formatUiLabel = (text: string) => {
  const normalized = text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return "";
  }

  return normalized
    .split(" ")
    .map((word) => {
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) {
        return upper;
      }
      const lower = word.toLowerCase();
      return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join(" ");
};

export const formatStatusLabel = (status?: string) => {
  if (!status) {
    return "";
  }
  return STATUS_LABELS[status] ?? formatUiLabel(status);
};
