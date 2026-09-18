import { SkeletonCircle, SkeletonLine, SkeletonList, SkeletonRect } from "@/design-system/skeletons/Shimmer";

const StageChipSkeleton = () => (
  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-2">
    <SkeletonCircle size={16} />
    <SkeletonLine className="h-3 w-16" />
  </div>
);

const DealDetailsSkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-3">
      <SkeletonLine className="h-4 w-40" />
      <div className="flex items-center gap-3">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonRect className="h-5 w-20 rounded-full" />
      </div>
      <SkeletonLine className="h-3 w-52" />
    </div>

    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-3">
      <SkeletonLine className="h-4 w-32" />
      <div className="flex flex-wrap gap-2">
        <StageChipSkeleton />
        <StageChipSkeleton />
        <StageChipSkeleton />
        <StageChipSkeleton />
        <StageChipSkeleton />
      </div>
    </div>

    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-4">
      <SkeletonLine className="h-4 w-32" />
      <SkeletonList
        count={4}
        renderItem={() => (
          <div className="space-y-2">
            <SkeletonLine className="h-3 w-44" />
            <SkeletonLine className="h-3 w-64" />
          </div>
        )}
      />
      <div className="flex gap-2">
        <SkeletonRect className="h-10 w-full rounded-lg" />
        <SkeletonRect className="h-10 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export default DealDetailsSkeleton;
