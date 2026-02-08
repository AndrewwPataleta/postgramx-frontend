import { SkeletonLine, SkeletonRect } from "@/components/skeletons/Shimmer";

const PageLoader = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4">
        <SkeletonLine className="h-5 w-40" />
        <SkeletonRect className="h-10 w-full rounded-xl" />
        <SkeletonRect className="h-32 w-full rounded-2xl" />
        <SkeletonLine className="h-3 w-52" />
        <SkeletonLine className="h-3 w-40" />
      </div>
    </div>
  );
};

export default PageLoader;
