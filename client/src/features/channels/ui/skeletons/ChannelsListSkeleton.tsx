import { SkeletonCircle, SkeletonLine, SkeletonList, SkeletonRect } from "@/design-system/skeletons/Shimmer";

const ChannelCardSkeleton = () => (
  <div className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm">
    <div className="flex items-start gap-3">
      <SkeletonCircle size={48} />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-36" />
        <SkeletonLine className="h-3 w-24" />
      </div>
      <SkeletonRect className="h-8 w-16 rounded-lg" />
    </div>
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      <SkeletonRect className="h-10 w-full rounded-xl" />
      <SkeletonRect className="h-10 w-full rounded-xl" />
      <SkeletonRect className="h-10 w-full rounded-xl" />
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <SkeletonRect className="h-5 w-20 rounded-full" />
      <SkeletonRect className="h-5 w-24 rounded-full" />
      <SkeletonRect className="h-5 w-16 rounded-full" />
    </div>
  </div>
);

const ChannelsListSkeleton = () => (
  <SkeletonList count={6} renderItem={() => <ChannelCardSkeleton />} />
);

export default ChannelsListSkeleton;
