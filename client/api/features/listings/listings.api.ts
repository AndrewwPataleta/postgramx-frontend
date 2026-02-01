import { postJson } from "@/api/core/apiClient";
import { buildAuthBody, requireInitDataToken } from "@/api/core/authEnvelope";
import type {
  ListingCreateRequestData,
  ListingUpdateRequestData,
  ListingsByChannelRequestData,
  ListingsByChannelResponse,
} from "./listings.types";

const withAuth = <T>(data: T) => buildAuthBody(data, requireInitDataToken());

export const createListing = async (data: ListingCreateRequestData): Promise<void> => {
  await postJson("/listings/create", withAuth(data));
};

export const updateListing = async (data: ListingUpdateRequestData): Promise<void> => {
  await postJson("/listings/update", withAuth(data));
};

export const disableListing = async (listingId: string): Promise<void> => {
  await postJson("/listings/disable", withAuth({ listingId }));
};

export const enableListing = async (listingId: string): Promise<void> => {
  await postJson("/listings/enable", withAuth({ listingId }));
};

export const listingsByChannel = async (
  data: ListingsByChannelRequestData
): Promise<ListingsByChannelResponse> => postJson("/listings/by-channel", withAuth(data));
