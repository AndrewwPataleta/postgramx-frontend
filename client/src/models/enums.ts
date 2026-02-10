export enum DealStatus {
  Pending = "PENDING",
  Active = "ACTIVE",
  Completed = "COMPLETED",
  Canceled = "CANCELED",
}

export enum DealStage {
  CREATIVE_AWAITING_SUBMIT = "CREATIVE_AWAITING_SUBMIT",
  CREATIVE_AWAITING_FOR_CHANGES = "CREATIVE_AWAITING_FOR_CHANGES",
  CREATIVE_AWAITING_CONFIRM = "CREATIVE_AWAITING_CONFIRM",
  SCHEDULING_AWAITING_SUBMIT = "SCHEDULING_AWAITING_SUBMIT",
  SCHEDULE_AWAITING_FOR_CHANGES = "SCHEDULE_AWAITING_FOR_CHANGES",
  SCHEDULING_AWAITING_CONFIRM = "SCHEDULING_AWAITING_CONFIRM",
  PAYMENT_AWAITING = "PAYMENT_AWAITING",
  PAYMENT_PARTIALLY_PAID = "PAYMENT_PARTIALLY_PAID",
  POST_SCHEDULED = "POST_SCHEDULED",
  DELIVERY_CONFIRMED = "DELIVERY_CONFIRMED",
  FINALIZED = "FINALIZED",
}

export enum EscrowStatus {
  Draft = "DRAFT",
  SchedulingPending = "SCHEDULING_PENDING",
  CreativeAwaitingSubmit = "CREATIVE_AWAITING_SUBMIT",
  CreativeAwaitingAdminReview = "CREATIVE_AWAITING_ADMIN_REVIEW",
  PaymentAwaiting = "PAYMENT_AWAITING",
  FundsPending = "FUNDS_PENDING",
  FundsConfirmed = "FUNDS_CONFIRMED",
  ApprovedScheduled = "APPROVED_SCHEDULED",
  PostedVerifying = "POSTED_VERIFYING",
  Completed = "COMPLETED",
  Canceled = "CANCELED",
  Refunded = "REFUNDED",
  Disputed = "DISPUTED",
}

export enum CreativeStatus {
  Draft = "DRAFT",
  Submitted = "SUBMITTED",
  Approved = "APPROVED",
  Rejected = "REJECTED",
}

export enum PublicationStatus {
  Pending = "PENDING",
  Published = "PUBLISHED",
  Verified = "VERIFIED",
  Failed = "FAILED",
  Canceled = "CANCELED",
}

export enum ListingFormat {
  Post = "POST",
}

export enum CurrencyCode {
  Ton = "TON",
}

export enum ChannelStatus {
  Draft = "DRAFT",
  PendingVerify = "PENDING_VERIFY",
  Verified = "VERIFIED",
  Failed = "FAILED",
  Revoked = "REVOKED",
}
