import { useEffect, useMemo, useState } from "react";
import { addHours, isSameDay, startOfDay } from "date-fns";
import { CalendarDays } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ScheduleDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
}

const TIME_INTERVAL_MINUTES = 5;

const pad2 = (n: number) => n.toString().padStart(2, "0");

const roundUpToInterval = (date: Date, minutes: number) => {
  const rounded = new Date(date);
  const ms = minutes * 60 * 1000;
  rounded.setTime(Math.ceil(rounded.getTime() / ms) * ms);
  rounded.setSeconds(0, 0);
  return rounded;
};

const clampToMin = (date: Date, min: Date) => (date < min ? new Date(min) : date);

const formatDisplayDateTime = (date: Date | null) => {
  if (!date) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const toDateInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const toTimeInputValue = (date: Date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

// min для <input type="time">, если выбран день = сегодня(minSelectableDay)
const minTimeStringForDay = (selectedDay: Date, minSelectableTime: Date) => {
  if (!isSameDay(selectedDay, minSelectableTime)) return "00:00";
  return toTimeInputValue(minSelectableTime);
};

export function ScheduleDatePicker({ value, onChange }: ScheduleDatePickerProps) {
  const isLocalDev = import.meta.env.DEV;
  // В локальной разработке убираем ограничение "+1 час" для более удобного тестирования.
  const minDateTime = useMemo(() => (isLocalDev ? new Date(0) : addHours(new Date(), 1)), [isLocalDev]);
  const minSelectableTime = useMemo(
    () => roundUpToInterval(minDateTime, TIME_INTERVAL_MINUTES),
    [minDateTime],
  );
  const minSelectableDay = useMemo(() => startOfDay(minSelectableTime), [minSelectableTime]);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"date" | "time">("date");

  // draft хранит выбранную пользователем дату-время внутри поповера
  const [draft, setDraft] = useState<Date | null>(value);

  // значения для native inputs
  const [dateValue, setDateValue] = useState<string>("");
  const [timeValue, setTimeValue] = useState<string>("");

  // sync при открытии
  useEffect(() => {
    if (!open) {
      setDraft(value);
      return;
    }

    setStep("date");

    const base = value ? clampToMin(value, minSelectableTime) : minSelectableTime;
    setDraft(base);

    setDateValue(toDateInputValue(base));
    setTimeValue(toTimeInputValue(base));
  }, [open, value, minSelectableTime]);

  const displayValue = formatDisplayDateTime(value);

  const handlePickDate = (nextDateStr: string) => {
    // nextDateStr: "YYYY-MM-DD"
    if (!nextDateStr) return;

    const [y, m, d] = nextDateStr.split("-").map((x) => Number(x));
    if (!y || !m || !d) return;

    const base = draft ?? minSelectableTime;

    const next = new Date(base);
    next.setFullYear(y, m - 1, d);
    next.setSeconds(0, 0);

    // если выбрали сегодня — время не меньше minSelectableTime
    const minForThisDay = isSameDay(next, minSelectableTime)
      ? minSelectableTime
      : startOfDay(next);

    const clamped = clampToMin(next, minForThisDay);

    setDraft(clamped);
    setDateValue(nextDateStr);

    // если после clamp время "сдвинулось" — обновим time input
    setTimeValue(toTimeInputValue(clamped));

    // перейти к времени
    setStep("time");
  };

  const handlePickTime = (nextTimeStr: string) => {
    // nextTimeStr: "HH:MM"
    if (!nextTimeStr) return;

    const [hh, mm] = nextTimeStr.split(":").map((x) => Number(x));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return;

    const base = draft ?? minSelectableTime;

    const next = new Date(base);
    next.setHours(hh, mm, 0, 0);

    // общий минимальный clamp (сейчас+1ч)
    const clamped = clampToMin(next, minSelectableTime);

    setDraft(clamped);
    setTimeValue(nextTimeStr);

    onChange(clamped);
    setOpen(false);
  };

  // ограничения для инпутов
  const minDateStr = useMemo(() => toDateInputValue(minSelectableDay), [minSelectableDay]);

  const selectedDayForMinTime = useMemo(() => {
    if (!dateValue) return minSelectableDay;
    const [y, m, d] = dateValue.split("-").map((x) => Number(x));
    const day = new Date(minSelectableDay);
    day.setFullYear(y, (m || 1) - 1, d || 1);
    day.setHours(0, 0, 0, 0);
    return day;
  }, [dateValue, minSelectableDay]);

  const minTimeStr = useMemo(
    () => minTimeStringForDay(selectedDayForMinTime, minSelectableTime),
    [selectedDayForMinTime, minSelectableTime],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="w-full text-left">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/80" />
            <Input
              readOnly
              value={displayValue}
              placeholder="Select date & time"
              className="h-11 cursor-pointer rounded-xl border-primary/30 bg-background/70 pl-9 text-sm font-medium text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.2)] transition focus-visible:ring-primary/40"
            />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        className="w-[min(100vw-2rem,420px)] rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-[0_20px_45px_-35px_hsl(var(--primary)/0.6)]"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-primary/90">
            {step === "date" ? "Select date" : "Select time"}
          </p>

          {step === "time" && (
            <button
              type="button"
              className="text-xs text-muted-foreground transition hover:text-foreground"
              onClick={() => setStep("date")}
            >
              Back
            </button>
          )}
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Выбранное время должно быть минимум на час вперед от текущего.
        </p>

        {step === "date" ? (
          <div className="space-y-2">
            <label className="block text-xs text-muted-foreground">Date</label>
            <input
              type="date"
              value={dateValue}
              min={minDateStr}
              onChange={(e) => handlePickDate(e.target.value)}
              className={cn(
                "w-full rounded-xl border border-primary/20 bg-background/70 px-3 py-2 text-sm text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/40",
              )}
            />
            <p className="text-[11px] text-muted-foreground/80">
              Earliest: {formatDisplayDateTime(minSelectableTime)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs text-muted-foreground">Time</label>
            <input
              type="time"
              value={timeValue}
              step={TIME_INTERVAL_MINUTES * 60}
              min={minTimeStr}
              onChange={(e) => handlePickTime(e.target.value)}
              className={cn(
                "w-full rounded-xl border border-primary/20 bg-background/70 px-3 py-2 text-sm text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/40",
              )}
            />
            <p className="text-[11px] text-muted-foreground/80">
              Min time for this date: {minTimeStr}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
