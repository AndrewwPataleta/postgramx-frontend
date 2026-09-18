import { SkeletonCircle, SkeletonLine, SkeletonList, SkeletonRect } from "@/design-system/skeletons/Shimmer";

const TransactionRowSkeleton = () => (
  <div className="glass p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div className="space-y-2">
      <SkeletonLine className="h-4 w-40" />
      <SkeletonLine className="h-3 w-52" />
      <SkeletonLine className="h-3 w-24" />
    </div>
    <div className="flex flex-col items-end gap-2">
      <SkeletonLine className="h-4 w-24" />
      <SkeletonRect className="h-5 w-16 rounded-full" />
    </div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="glass p-5">
      <div className="flex items-center gap-4">
        <SkeletonCircle size={56} />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-4 w-40" />
          <SkeletonLine className="h-3 w-28" />
          <SkeletonRect className="h-6 w-36 rounded-full" />
        </div>
      </div>
    </div>

    <div className="flex gap-6 border-b border-border/60 pb-3">
      <SkeletonLine className="h-4 w-20" />
      <SkeletonLine className="h-4 w-28" />
      <SkeletonLine className="h-4 w-24" />
    </div>

    <div className="rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border/40 space-y-2">
        <SkeletonLine className="h-4 w-40" />
        <SkeletonLine className="h-3 w-52" />
      </div>
      <div className="px-5 py-5 space-y-4 pb-8">
        <div className="grid gap-3 sm:grid-cols-2">
          <SkeletonRect className="h-20 w-full rounded-2xl" />
          <SkeletonRect className="h-20 w-full rounded-2xl" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SkeletonRect className="h-16 w-full rounded-2xl" />
          <SkeletonRect className="h-16 w-full rounded-2xl" />
        </div>
        <SkeletonRect className="h-8 w-40 rounded-lg" />
      </div>
    </div>

    <div className="rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border/40 space-y-2">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-3 w-44" />
      </div>
      <div className="px-5 py-5 space-y-4 pb-8">
        <SkeletonList count={6} renderItem={() => <TransactionRowSkeleton />} />
      </div>
    </div>
  </div>
);

export default ProfileSkeleton;
