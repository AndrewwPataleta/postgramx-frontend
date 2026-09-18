import { SkeletonCircle, SkeletonLine, SkeletonList, SkeletonRect } from "@/design-system/skeletons/Shimmer";

const DealCardSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
    <div className="flex items-start gap-3">
      <SkeletonCircle size={40} />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-40" />
        <SkeletonLine className="h-3 w-28" />
      </div>
      <SkeletonRect className="h-6 w-16 rounded-full" />
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <SkeletonRect className="h-5 w-20 rounded-full" />
      <SkeletonRect className="h-5 w-24 rounded-full" />
      <SkeletonRect className="h-5 w-16 rounded-full" />
    </div>
    <SkeletonLine className="mt-4 h-3 w-48" />
  </div>
);

const DealsPageSkeleton = () => (
  <div className="space-y-6">
    <div>
      <SkeletonLine className="h-5 w-28" />
      <div className="mt-4 flex gap-6 border-b border-border/60 pb-3">
        <SkeletonLine className="h-3 w-16" />
        <SkeletonLine className="h-3 w-16" />
        <SkeletonLine className="h-3 w-20" />
      </div>
    </div>
    <div className="border-t border-border/60" />
    <SkeletonList count={6} renderItem={() => <DealCardSkeleton />} />
  </div>
);

export default DealsPageSkeleton;
