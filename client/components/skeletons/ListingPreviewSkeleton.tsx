import { SkeletonLine, SkeletonList, SkeletonRect } from "./Shimmer";

const ListingPreviewSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-6">
    <section className="space-y-3">
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-40" />
        <SkeletonLine className="h-3 w-52" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SkeletonRect className="h-14 w-full rounded-xl" />
        <SkeletonRect className="h-14 w-full rounded-xl" />
        <SkeletonRect className="h-14 w-full rounded-xl" />
        <SkeletonRect className="h-14 w-full rounded-xl" />
      </div>
    </section>

    <section className="space-y-3">
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-36" />
        <SkeletonLine className="h-3 w-44" />
      </div>
      <div className="flex flex-wrap gap-2">
        <SkeletonRect className="h-6 w-32 rounded-full" />
        <SkeletonRect className="h-6 w-28 rounded-full" />
      </div>
    </section>

    <section className="space-y-3">
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-36" />
        <SkeletonLine className="h-3 w-44" />
      </div>
      <div className="flex flex-wrap gap-2">
        <SkeletonRect className="h-6 w-24 rounded-full" />
        <SkeletonRect className="h-6 w-24 rounded-full" />
        <SkeletonRect className="h-6 w-16 rounded-full" />
      </div>
      <SkeletonRect className="h-16 w-full rounded-xl" />
      <SkeletonRect className="h-6 w-32 rounded-full" />
    </section>

    <section className="space-y-3">
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-40" />
        <SkeletonLine className="h-3 w-52" />
      </div>
      <SkeletonList
        count={2}
        renderItem={() => <SkeletonRect className="h-16 w-full rounded-xl" />}
      />
    </section>
  </div>
);

export default ListingPreviewSkeleton;
