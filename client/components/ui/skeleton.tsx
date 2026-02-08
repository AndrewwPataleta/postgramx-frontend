import { cn } from "@/lib/utils";
import { Shimmer } from "@/components/skeletons/Shimmer";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <Shimmer className={cn("rounded-md", className)} {...props} />;
}

export { Skeleton };
