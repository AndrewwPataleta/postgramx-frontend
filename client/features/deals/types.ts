import type {
  DealCreativeEntity,
  DealEscrowEntity,
  DealListingSnapshot,
  DealPublicationEntity,
} from "@/models/entities";
import { DealStage } from "@/models/enums";
import type { DealStatus } from "@/models/enums";

export type DealDto = {
  id: string;
  status: DealStatus;
  stage: DealStage;
  scheduledAt: string | null;
  listingSnapshot: DealListingSnapshot;
  escrow: DealEscrowEntity;
  creatives: DealCreativeEntity[];
  publication: DealPublicationEntity | null;
};

export type DealDetailDto = DealDto;

export type CreateDealPayload = {
  listingId: string;
  brief?: string;
};

export { DealStage };
