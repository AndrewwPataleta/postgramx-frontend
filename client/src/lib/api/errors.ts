import { normalizeError } from "@shared/api/errors";
import type { TranslationKey } from "@/i18n/translations";

export const getErrorMessage = (
  error: unknown,
  fallback: string,
  translate?: (key: TranslationKey) => string,
) => normalizeError(error, fallback, translate);
