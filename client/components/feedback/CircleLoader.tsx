import { cn } from "@/lib/utils";

interface CircleLoaderProps {
  items?: number;
  size?: number;
  className?: string;
  itemClassName?: string;
}

const CircleLoader = ({
  items = 3,
  size = 32,
  className,
  itemClassName,
}: CircleLoaderProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={`circle-loader-${index}`}
          className={cn("flex items-center justify-center", itemClassName)}
        >
          <span
            className="animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
            style={{ width: size, height: size }}
          />
        </div>
      ))}
    </div>
  );
};

export default CircleLoader;
