import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const normalizeSize = (value?: string | number) =>
  typeof value === "number" ? `${value}px` : value;

interface ShimmerProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

const Shimmer = ({ className, width, height, style, ...props }: ShimmerProps) => (
  <div
    aria-hidden="true"
    className={cn("skeleton-shimmer", className)}
    style={{
      ...style,
      width: normalizeSize(width) ?? style?.width,
      height: normalizeSize(height) ?? style?.height,
    }}
    {...props}
  />
);

interface SkeletonShapeProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

const SkeletonLine = ({ className, width, height, ...props }: SkeletonShapeProps) => (
  <Shimmer
    className={cn("h-3 w-full rounded-md", className)}
    width={width}
    height={height}
    {...props}
  />
);

interface SkeletonCircleProps extends HTMLAttributes<HTMLDivElement> {
  size?: string | number;
}

const SkeletonCircle = ({ className, size = 40, ...props }: SkeletonCircleProps) => (
  <Shimmer
    className={cn("rounded-full", className)}
    width={size}
    height={size}
    {...props}
  />
);

const SkeletonRect = ({ className, width, height, ...props }: SkeletonShapeProps) => (
  <Shimmer
    className={cn("rounded-lg", className)}
    width={width}
    height={height}
    {...props}
  />
);

interface SkeletonListProps {
  count?: number;
  className?: string;
  itemClassName?: string;
  renderItem?: (index: number) => ReactNode;
}

const SkeletonList = ({
  count = 3,
  className,
  itemClassName,
  renderItem,
}: SkeletonListProps) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={`skeleton-row-${index}`} className={itemClassName}>
        {renderItem ? renderItem(index) : <SkeletonLine />}
      </div>
    ))}
  </div>
);

export {
  Shimmer,
  SkeletonLine,
  SkeletonCircle,
  SkeletonRect,
  SkeletonList,
};
