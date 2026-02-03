import { DealStage, DealStatus } from "@/models/enums";

const NANO_FACTOR = BigInt(1_000_000_000);

export const formatNanoToTon = (amountNano: string): string => {
  try {
    const value = BigInt(amountNano);
    const whole = value / NANO_FACTOR;
    const fraction = value % NANO_FACTOR;
    if (fraction === BigInt(0)) {
      return whole.toString();
    }
    const fractionPadded = fraction.toString().padStart(9, "0").replace(/0+$/, "");
    return `${whole.toString()}.${fractionPadded}`;
  } catch {
    return amountNano;
  }
};

export const safeIsoToLocal = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
};

export const isDealPending = (status: DealStatus): boolean =>
  status === DealStatus.Pending;

export const isDealActive = (status: DealStatus): boolean =>
  status === DealStatus.Active;

export const isDealCompleted = (status: DealStatus): boolean =>
  status === DealStatus.Completed;

export const isDealCanceled = (status: DealStatus): boolean =>
  status === DealStatus.Canceled;

export const stageOrder: DealStage[] = [
  DealStage.CREATIVE_AWAITING_SUBMIT,
  DealStage.CREATIVE_AWAITING_CONFIRM,
  DealStage.SCHEDULING_AWAITING_SUBMIT,
  DealStage.SCHEDULING_AWAITING_CONFIRM,
  DealStage.PAYMENT_AWAITING,
  DealStage.POST_SCHEDULED,
  DealStage.DELIVERY_CONFIRMED,
  DealStage.FINALIZED,
];
