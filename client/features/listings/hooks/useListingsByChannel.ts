import { useQuery } from "@tanstack/react-query";
import { listingsByChannel } from "@/api/features/listings/listings.api";
import type {
  ListingsByChannelRequestData,
  ListingsByChannelResponse,
} from "@/api/features/listings/listings.types";

export const listingsQueryKeys = {
  all: ["listings"] as const,
  byChannelRoot: ["listings", "by-channel"] as const,
  byChannel: (filters: ListingsByChannelRequestData) =>
    ["listings", "by-channel", filters] as const,
};

export const useListingsByChannel = (
  filters: ListingsByChannelRequestData,
  options?: { enabled?: boolean; staleTime?: number; refetchOnMount?: boolean }
) =>
  useQuery<ListingsByChannelResponse>({
    queryKey: listingsQueryKeys.byChannel(filters),
    queryFn: () => listingsByChannel(filters),
    enabled: options?.enabled,
    staleTime: options?.staleTime,
    refetchOnMount: options?.refetchOnMount,
  });
