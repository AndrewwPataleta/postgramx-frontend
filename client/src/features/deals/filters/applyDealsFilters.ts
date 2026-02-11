import { parseTonToNano } from "@/lib/ton";
import type { DealEntity } from "@/models/entities";
import { DEAL_STAGE_GROUPS, type DealSectionKey, type DealsFilters } from "./filters.types";

const DAY_MS = 24 * 60 * 60 * 1000;

const getDateRange = (filters: DealsFilters): { from?: Date; to?: Date } => {
  const now = new Date();

  if (filters.datePreset === "today") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }

  if (filters.datePreset === "7d" || filters.datePreset === "30d") {
    const days = filters.datePreset === "7d" ? 7 : 30;
    return { from: new Date(now.getTime() - days * DAY_MS), to: now };
  }

  if (filters.datePreset === "custom") {
    const from = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
    const to = filters.dateTo ? new Date(filters.dateTo) : undefined;
    if (to) {
      to.setHours(23, 59, 59, 999);
    }
    return {
      from: from && !Number.isNaN(from.getTime()) ? from : undefined,
      to: to && !Number.isNaN(to.getTime()) ? to : undefined,
    };
  }

  return {};
};

const textIncludes = (source: string | null | undefined, query: string): boolean =>
  Boolean(source?.toLowerCase().includes(query));

const getExpiringDate = (deal: DealEntity): Date | undefined => {
  const ext = deal as DealEntity & {
    deadlineAt?: string | null;
    expireAt?: string | null;
    expiresAt?: string | null;
    expiresIn?: number | null;
  };

  const dateCandidates = [deal.idleExpiresAt, ext.deadlineAt, ext.expireAt, ext.expiresAt].filter(
    (value): value is string => Boolean(value)
  );

  for (const value of dateCandidates) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (typeof ext.expiresIn === "number" && ext.expiresIn >= 0) {
    return new Date(Date.now() + ext.expiresIn * 1000);
  }

  return undefined;
};

const hasIssuesValue = (deal: DealEntity): boolean | undefined => {
  const publicationError = deal.publication?.error;
  if (typeof publicationError === "string") {
    return publicationError.length > 0;
  }
  const ext = deal as DealEntity & { hasIssues?: boolean };
  return typeof ext.hasIssues === "boolean" ? ext.hasIssues : undefined;
};

const requiresReviewValue = (deal: DealEntity): boolean | undefined => {
  const ext = deal as DealEntity & {
    needsCreativeApproval?: boolean;
    scheduleApproval?: boolean;
    requiresReview?: boolean;
  };

  if (typeof ext.requiresReview === "boolean") {
    return ext.requiresReview;
  }

  if (typeof ext.needsCreativeApproval === "boolean" || typeof ext.scheduleApproval === "boolean") {
    return Boolean(ext.needsCreativeApproval || ext.scheduleApproval);
  }

  return undefined;
};

export const detectDealsFilterCapabilities = (deals: DealEntity[]) => {
  const supportsExpiring24h = deals.some((deal) => Boolean(getExpiringDate(deal)));
  const supportsRequiresReview = deals.some((deal) => typeof requiresReviewValue(deal) === "boolean");
  const supportsHasIssues = deals.some((deal) => typeof hasIssuesValue(deal) === "boolean");

  return {
    supportsExpiring24h,
    supportsRequiresReview,
    supportsHasIssues,
  };
};

export const applyDealsFilters = (
  deals: DealEntity[],
  filters: DealsFilters,
  activeTab: DealSectionKey,
  currentUserId?: string
): DealEntity[] => {
  const tabStages = new Set(DEAL_STAGE_GROUPS[activeTab]);
  const selectedStages = new Set(filters.stages);
  const query = filters.query.trim().toLowerCase();
  const minNano =
    typeof filters.amountMinTon === "number" ? parseTonToNano(String(filters.amountMinTon)) : null;
  const maxNano =
    typeof filters.amountMaxTon === "number" ? parseTonToNano(String(filters.amountMaxTon)) : null;
  const { from, to } = getDateRange(filters);

  return deals.filter((deal) => {
    if (!tabStages.has(deal.stage)) {
      return false;
    }

    if (selectedStages.size > 0 && !selectedStages.has(deal.stage)) {
      return false;
    }

    if (query) {
      const username = deal.channel?.username ?? "";
      const title = deal.channel?.title ?? "";
      if (!textIncludes(username, query) && !textIncludes(title, query)) {
        return false;
      }
    }

    if (minNano || maxNano) {
      let amountNano: bigint | null = null;
      try {
        amountNano = BigInt(deal.escrow?.amountNano ?? deal.listingSnapshot?.priceNano ?? "");
      } catch {
        amountNano = null;
      }
      if (amountNano !== null) {
        if (minNano !== null && amountNano < minNano) {
          return false;
        }
        if (maxNano !== null && amountNano > maxNano) {
          return false;
        }
      }
    }

    if (from || to) {
      const createdAt = new Date(deal.createdAt);
      if (!Number.isNaN(createdAt.getTime())) {
        if (from && createdAt < from) {
          return false;
        }
        if (to && createdAt > to) {
          return false;
        }
      }
    }

    if (filters.expiring24h) {
      const expiringDate = getExpiringDate(deal);
      if (expiringDate) {
        const msLeft = expiringDate.getTime() - Date.now();
        if (msLeft < 0 || msLeft > DAY_MS) {
          return false;
        }
      }
    }

    if (filters.requiresReview === true) {
      const value = requiresReviewValue(deal);
      if (value === false) {
        return false;
      }
    }

    if (filters.hasIssues === true) {
      const value = hasIssuesValue(deal);
      if (value === false) {
        return false;
      }
    }

    return true;
  });
};
