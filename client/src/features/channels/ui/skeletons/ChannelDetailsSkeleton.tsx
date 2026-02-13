import { SkeletonCircle, SkeletonLine, SkeletonList, SkeletonRect } from "@/design-system/skeletons/Shimmer";

const ListingRowSkeleton = () => (
  <div className="rounded-xl border border-border/60 bg-card/70 p-3 space-y-2">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-24" />
        <SkeletonLine className="h-3 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonRect className="h-8 w-20 rounded-lg" />
        <SkeletonRect className="h-8 w-8 rounded-lg" />
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      <SkeletonRect className="h-4 w-16 rounded-full" />
      <SkeletonRect className="h-4 w-20 rounded-full" />
      <SkeletonRect className="h-4 w-12 rounded-full" />
    </div>
  </div>
);

const ModeratorRowSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/70 p-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3 min-w-0">
      <SkeletonCircle size={40} />
      <div className="min-w-0 space-y-2">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-3 w-24" />
      </div>
    </div>
    <SkeletonRect className="h-6 w-12 rounded-full" />
  </div>
);

const ChannelDetailsListingsSkeleton = ({ count = 6 }: { count?: number }) => (
  <SkeletonList count={count} renderItem={() => <ListingRowSkeleton />} />
);

const ChannelDetailsModeratorsSkeleton = ({ count = 6 }: { count?: number }) => (
  <SkeletonList count={count} renderItem={() => <ModeratorRowSkeleton />} />
);

const ChannelDetailsSkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <SkeletonCircle size={52} />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-5 w-40" />
          <SkeletonLine className="h-3 w-24" />
          <SkeletonLine className="h-3 w-48" />
          <SkeletonLine className="h-3 w-32" />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-4 w-40" />
      </div>

      <ChannelDetailsListingsSkeleton />
    </div>
  </div>
);

export {
  ChannelDetailsSkeleton as default,
  ChannelDetailsListingsSkeleton,
  ChannelDetailsModeratorsSkeleton,
};
