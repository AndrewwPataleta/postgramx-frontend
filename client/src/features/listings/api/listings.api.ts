import { apiPost } from "@/api/core/http";
import { parseTonToNano } from "@/lib/ton";
import type { ListingEntity, Paged } from "@/models/entities";
import type { ListingCreateInput, ListingUpdatePatch } from "@/models/inputs";

export const createListing = async (
  data: ListingCreateInput,
): Promise<ListingEntity> =>
  apiPost<ListingEntity, ListingCreateInput>("/listings/create", data);

export const updateListing = async (data: {
  id: string;
  patch: Partial<ListingUpdatePatch>;
}): Promise<ListingEntity> =>
  apiPost<ListingEntity, typeof data>("/listings/update", {
    ...data,
    patch:
      typeof data.patch.priceTon === "string"
        ? {
            ...data.patch,
            priceNano:
              parseTonToNano(data.patch.priceTon)?.toString() ??
              data.patch.priceNano,
          }
        : data.patch,
  });

export const listListingsByChannel = async (data: {
  channelId: string;
  page?: number;
  limit?: number;
  activeOnly?: boolean;
}): Promise<Paged<ListingEntity>> =>
  apiPost<Paged<ListingEntity>, typeof data>("/listings/by-channel", data);
