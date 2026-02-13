const MILLISECONDS_IN_SECOND = 1_000;
const MILLISECONDS_IN_MINUTE = 60 * MILLISECONDS_IN_SECOND;
const MILLISECONDS_IN_HOUR = 60 * MILLISECONDS_IN_MINUTE;
const PAD_LENGTH = 2;
const PAD_CHAR = "0";

export const COUNTDOWN_TICK_MS = MILLISECONDS_IN_SECOND;

const padWithLeadingZero = (value: number) =>
  value.toString().padStart(PAD_LENGTH, PAD_CHAR);

export const formatRelativeTime = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diffMs / MILLISECONDS_IN_MINUTE));
  if (minutes < 60) {
    return `Updated ${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `Updated ${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  return `Updated ${days}d ago`;
};

export const formatScheduleDate = (value?: string | null) => {
  if (!value) {
    return "Waiting for scheduling";
  }
  const date = new Date(value);
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} · ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export const formatCountdown = (value?: string) => {
  if (!value) {
    return null;
  }
  const diffMs = new Date(value).getTime() - Date.now();
  const minutes = Math.max(0, Math.round(diffMs / MILLISECONDS_IN_MINUTE));
  return `${minutes}m`;
};

export const formatHmsCountdown = (deadline: string | null | undefined) => {
  if (!deadline) {
    return null;
  }

  const deadlineMs = new Date(deadline).getTime();
  if (Number.isNaN(deadlineMs)) {
    return null;
  }

  const diff = Math.max(0, deadlineMs - Date.now());
  const hours = Math.floor(diff / MILLISECONDS_IN_HOUR);
  const minutes = Math.floor(
    (diff % MILLISECONDS_IN_HOUR) / MILLISECONDS_IN_MINUTE,
  );
  const seconds = Math.floor(
    (diff % MILLISECONDS_IN_MINUTE) / MILLISECONDS_IN_SECOND,
  );

  return `${padWithLeadingZero(hours)}:${padWithLeadingZero(minutes)}:${padWithLeadingZero(seconds)}`;
};
