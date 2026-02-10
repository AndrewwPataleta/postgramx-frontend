import type { HTMLAttributes, ReactNode } from "react";

export type AnimatedListProps = HTMLAttributes<HTMLDivElement> & {
  itemsCount: number;
  children: ReactNode;
};

export const AnimatedList = ({
  itemsCount: _itemsCount,
  children,
  className,
  ...rest
}: AnimatedListProps) => {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
};

export type AnimatedListItemProps = HTMLAttributes<HTMLDivElement> & {
  index: number;
  pulseKey?: string | number | boolean;
  children: ReactNode;
};

export const AnimatedListItem = ({
  index: _index,
  pulseKey: _pulseKey,
  className,
  children,
  ...rest
}: AnimatedListItemProps) => {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
};
