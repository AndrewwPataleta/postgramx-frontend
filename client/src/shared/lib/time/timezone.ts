const FALLBACK_TIME_ZONE = "UTC";

const toDate = (dateIso: string) => {
  const parsed = new Date(dateIso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const pad2 = (value: string | undefined) => (value ?? "00").padStart(2, "0");

const formatFromParts = (parts: Intl.DateTimeFormatPart[]) => {
  const lookup = new Map(parts.map((part) => [part.type, part.value]));
  const year = lookup.get("year") ?? "0000";
  const month = pad2(lookup.get("month"));
  const day = pad2(lookup.get("day"));
  const hour = pad2(lookup.get("hour"));
  const minute = pad2(lookup.get("minute"));
  return { base: `${year}-${month}-${day} ${hour}:${minute}`, zone: lookup.get("timeZoneName") };
};

export const getDeviceTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE;

export const formatLocal = (dateIso: string, timeZone?: string | null): string => {
  const date = toDate(dateIso);
  if (!date) return "";

  const resolvedTimeZone = timeZone || FALLBACK_TIME_ZONE;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: resolvedTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });

  const { base, zone } = formatFromParts(formatter.formatToParts(date));
  return `${base} (${zone ?? resolvedTimeZone})`;
};

export const formatUtc = (dateIso: string): string => {
  const date = toDate(dateIso);
  if (!date) return "";

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const { base } = formatFromParts(formatter.formatToParts(date));
  return `${base} UTC`;
};

export const buildDualTimeLabel = (dateIso: string, timeZone?: string | null) => ({
  localLabel: formatLocal(dateIso, timeZone),
  utcLabel: formatUtc(dateIso),
});

