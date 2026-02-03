export const statusStyles = {
  awaitingApproval: "bg-warning/15 text-warning border-warning/40",
  paymentRequired: "bg-warning/15 text-warning border-warning/40",
  confirming: "bg-warning/15 text-warning border-warning/40",
  fundsLocked: "bg-primary/15 text-primary border-primary/40",
  creativeReview: "bg-accent/15 text-accent border-accent/40",
  scheduled: "bg-accent/15 text-accent border-accent/40",
  verifying: "bg-accent/15 text-accent border-accent/40",
  completed: "bg-success/15 text-success border-success/40",
  refunded: "bg-destructive/15 text-destructive border-destructive/40",
};

export type StatusKey = keyof typeof statusStyles;
