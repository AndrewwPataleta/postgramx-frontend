import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createListing,
  disableListing,
  enableListing,
  updateListing,
} from "@/api/features/listings/listings.api";
import type {
  ListingCreateRequestData,
  ListingUpdateRequestData,
} from "@/api/features/listings/listings.types";
import { listingsQueryKeys } from "./useListingsByChannel";

const invalidateListings = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: listingsQueryKeys.byChannelRoot });
  queryClient.invalidateQueries({ queryKey: ["marketplaceChannels"] });
  queryClient.invalidateQueries({ queryKey: ["channelsList"] });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ListingCreateRequestData) => createListing(payload),
    onSuccess: () => {
      invalidateListings(queryClient);
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ListingUpdateRequestData) => updateListing(payload),
    onSuccess: () => {
      invalidateListings(queryClient);
    },
  });
};

export const useDisableListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => disableListing(listingId),
    onSuccess: () => {
      invalidateListings(queryClient);
    },
  });
};

export const useEnableListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => enableListing(listingId),
    onSuccess: () => {
      invalidateListings(queryClient);
    },
  });
};
