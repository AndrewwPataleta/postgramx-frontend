const NANO_FACTOR = 1_000_000_000n;

const formatIntegerString = (value: string) => {
  const normalized = value.replace(/^0+(?=\d)/, "");
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const nanoToTonString = (nano: string | bigint): string => {
  const value = typeof nano === "bigint" ? nano : BigInt(nano);
  const isNegative = value < 0n;
  const absValue = isNegative ? -value : value;
  const whole = absValue / NANO_FACTOR;
  const fraction = absValue % NANO_FACTOR;
  const fractionString = fraction.toString().padStart(9, "0").replace(/0+$/, "");
  const result = fractionString
    ? `${whole.toString()}.${fractionString}`
    : whole.toString();
  return isNegative ? `-${result}` : result;
};

export const formatTonString = (value: string): string => {
  const [whole, fraction] = value.split(".");
  const formattedWhole = formatIntegerString(whole ?? "0");
  return fraction ? `${formattedWhole}.${fraction}` : formattedWhole;
};

export const formatTonFromNano = (nano: string): string => {
  try {
    return formatTonString(nanoToTonString(nano));
  } catch {
    return nano;
  }
};

export const isPositiveNano = (nano: string): boolean => {
  try {
    return BigInt(nano) > 0n;
  } catch {
    return false;
  }
};

export const parseTonToNano = (value: string): bigint | null => {
  const normalized = value.trim().replace(/,/g, "");
  if (!normalized) {
    return null;
  }
  if (!/^\d+(\.\d{0,9})?$/.test(normalized)) {
    return null;
  }
  const [whole = "0", fraction = ""] = normalized.split(".");
  const paddedFraction = `${fraction}000000000`.slice(0, 9);
  try {
    return BigInt(whole) * NANO_FACTOR + BigInt(paddedFraction);
  } catch {
    return null;
  }
};
