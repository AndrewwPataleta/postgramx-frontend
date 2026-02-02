export enum DealStatus {
  Pending = "PENDING",
  Active = "ACTIVE",
  Completed = "COMPLETED",
  Canceled = "CANCELED",
}

export enum DealStage {
  CreativePending = "CREATIVE_PENDING",
  CreativeSubmitted = "CREATIVE_SUBMITTED",
  CreativeChangesRequested = "CREATIVE_CHANGES_REQUESTED",
  CreativeApproved = "CREATIVE_APPROVED",
  Scheduled = "SCHEDULED",
  PaymentPending = "PAYMENT_PENDING",
  Paid = "PAID",
  Published = "PUBLISHED",
  Verified = "VERIFIED",
  Completed = "COMPLETED",
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
