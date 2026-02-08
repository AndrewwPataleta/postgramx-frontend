import { SkeletonLine, SkeletonList, SkeletonRect } from "./Shimmer";

const EditListingSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <SkeletonLine className="h-5 w-40" />
      <SkeletonLine className="h-3 w-52" />
    </div>

    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-4">
      <SkeletonRect className="h-12 w-full rounded-xl" />
      <SkeletonRect className="h-12 w-full rounded-xl" />
      <SkeletonRect className="h-12 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        <SkeletonRect className="h-12 w-full rounded-xl" />
        <SkeletonRect className="h-12 w-full rounded-xl" />
      </div>
      <SkeletonRect className="h-24 w-full rounded-xl" />
    </div>

    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-3">
      <SkeletonLine className="h-4 w-32" />
      <SkeletonList count={4} renderItem={() => <SkeletonRect className="h-8 w-full rounded-lg" />} />
    </div>

    <div className="flex gap-3">
      <SkeletonRect className="h-10 w-full rounded-lg" />
      <SkeletonRect className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

export default EditListingSkeleton;
