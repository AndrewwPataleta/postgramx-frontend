import { SkeletonLine, SkeletonList, SkeletonRect } from "./Shimmer";

const StepCardSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-3">
    <div className="flex items-center gap-2">
      <SkeletonRect className="h-4 w-10 rounded-full" />
      <SkeletonLine className="h-4 w-32" />
    </div>
    <SkeletonList
      count={2}
      renderItem={() => <SkeletonLine className="h-3 w-full" />}
    />
    <SkeletonRect className="h-9 w-full rounded-lg" />
  </div>
);

const PreDealStatusSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <SkeletonLine className="h-3 w-32" />
      <SkeletonLine className="h-5 w-56" />
    </div>
    <SkeletonList count={3} renderItem={() => <StepCardSkeleton />} />
  </div>
);

export default PreDealStatusSkeleton;
