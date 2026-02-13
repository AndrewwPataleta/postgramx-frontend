import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/design-system/skeletons/Shimmer";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & { shimmer?: boolean };

export const Skeleton = ({ className, shimmer = true, ...props }: SkeletonProps) => {
  if (!shimmer) {
    return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
  }
  return <Shimmer className={cn("rounded-md", className)} {...props} />;
};
