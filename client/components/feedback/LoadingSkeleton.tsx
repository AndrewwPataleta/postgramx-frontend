import { cn } from "@/lib/utils";
import CircleLoader from "@/components/feedback/CircleLoader";

interface LoadingSkeletonProps {
  items?: number;
  className?: string;
  itemClassName?: string;
}

const LoadingSkeleton = ({
  items = 3,
  className,
  itemClassName,
}: LoadingSkeletonProps) => {
  return (
    <CircleLoader
      items={items}
      className={cn("py-2", className)}
      itemClassName={itemClassName}
    />
  );
};

export default LoadingSkeleton;
