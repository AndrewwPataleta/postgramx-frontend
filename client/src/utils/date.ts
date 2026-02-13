export function toUtcIsoString(localDateInput: string | Date): string {
  const date =
    typeof localDateInput === "string"
      ? new Date(localDateInput)
      : localDateInput;

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date input");
  }

  return date.toISOString();
}

export function formatLocalDisplay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}
