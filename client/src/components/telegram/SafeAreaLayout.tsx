import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SafeAreaLayoutProps {
  children: ReactNode;
  bottomNavHeight?: number;
  className?: string;
}

const SafeAreaLayout = ({
  children,
  bottomNavHeight = 0,
  className,
}: SafeAreaLayoutProps) => {
  const style: CSSProperties = {
    paddingTop:
      "calc(var(--tg-content-safe-area-inset-top) + var(--tg-safe-area-inset-top))",
    paddingBottom: `calc(max(var(--tg-safe-bottom), var(--tg-content-safe-area-inset-bottom)) + ${bottomNavHeight}px)`,
    paddingLeft:
      "max(var(--tg-safe-left), var(--tg-content-safe-area-inset-left))",
    paddingRight:
      "max(var(--tg-safe-right), var(--tg-content-safe-area-inset-right))",
  };

  return (
    <div className={cn("flex-1 bg-background", className)} style={style}>
      {children}
    </div>
  );
};

export default SafeAreaLayout;
