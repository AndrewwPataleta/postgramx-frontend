import { SkeletonLine, SkeletonList, SkeletonRect } from "@/design-system/skeletons/Shimmer";

interface ListingsSkeletonProps {
  count?: number;
  variant?: "compact" | "full";
}

const ListingCardSkeleton = ({ variant = "full" }: { variant?: "compact" | "full" }) => (
  <div
    className={`rounded-2xl border border-border/60 bg-card/80 p-4 ${
      variant === "compact" ? "space-y-3" : "space-y-4"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <SkeletonLine className="h-4 w-40" />
      <SkeletonRect className="h-6 w-16 rounded-full" />
    </div>
    <div className="flex flex-wrap gap-2">
      <SkeletonRect className="h-5 w-24 rounded-full" />
      <SkeletonRect className="h-5 w-20 rounded-full" />
    </div>
    <div className="flex flex-wrap gap-2">
      <SkeletonRect className="h-5 w-20 rounded-full" />
      <SkeletonRect className="h-5 w-24 rounded-full" />
      <SkeletonRect className="h-5 w-16 rounded-full" />
    </div>
    {variant === "full" ? (
      <div className="flex gap-2">
        <SkeletonRect className="h-9 w-full rounded-lg" />
        <SkeletonRect className="h-9 w-full rounded-lg" />
      </div>
    ) : null}
  </div>
);

const ListingsSkeleton = ({ count = 6, variant = "full" }: ListingsSkeletonProps) => (
  <SkeletonList count={count} renderItem={() => <ListingCardSkeleton variant={variant} />} />
);

export default ListingsSkeleton;
