import { SkeletonCircle, SkeletonLine, SkeletonList, SkeletonRect } from "./Shimmer";

const MarketplaceCardSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-4">
    <div className="flex items-start gap-3">
      <SkeletonCircle size={48} />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-44" />
        <SkeletonLine className="h-3 w-28" />
        <SkeletonLine className="h-3 w-36" />
      </div>
      <SkeletonRect className="h-8 w-12 rounded-lg" />
    </div>
    <div className="flex flex-wrap gap-2">
      <SkeletonRect className="h-5 w-24 rounded-full" />
      <SkeletonRect className="h-5 w-20 rounded-full" />
      <SkeletonRect className="h-5 w-16 rounded-full" />
    </div>
    <div className="rounded-xl border border-border/50 bg-background/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-3 w-28" />
        <SkeletonRect className="h-6 w-16 rounded-full" />
      </div>
      <SkeletonLine className="h-3 w-40" />
      <SkeletonLine className="h-3 w-32" />
    </div>
  </div>
);

const MarketplaceListSkeleton = () => (
  <SkeletonList count={6} renderItem={() => <MarketplaceCardSkeleton />} />
);

export default MarketplaceListSkeleton;
