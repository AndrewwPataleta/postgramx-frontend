export const formatRelativeTime = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
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
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  return `${minutes}m`;
};
