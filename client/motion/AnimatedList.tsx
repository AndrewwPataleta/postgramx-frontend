import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { listContainer, listItem } from "./presets";
import { motionTokens } from "./tokens";
import { useMotionEnabled } from "./MotionProvider";

type AnimatedListContextValue = {
  stagger: number;
  maxStaggerItems: number;
  reducedMotion: boolean;
};

const AnimatedListContext = createContext<AnimatedListContextValue | null>(null);

export type AnimatedListProps = HTMLAttributes<HTMLDivElement> & {
  itemsCount: number;
  stagger?: number;
  maxStaggerItems?: number;
  children: ReactNode;
};

export const AnimatedList = ({
  itemsCount,
  stagger = motionTokens.list.stagger,
  maxStaggerItems = motionTokens.list.maxStaggerItems,
  children,
  className,
  ...rest
}: AnimatedListProps) => {
  const motionEnabled = useMotionEnabled();
  const reducedMotion = !motionEnabled;
  const resolvedMaxStagger = Math.min(maxStaggerItems, itemsCount);

  const contextValue = useMemo(
    () => ({
      stagger,
      maxStaggerItems: resolvedMaxStagger,
      reducedMotion,
    }),
    [resolvedMaxStagger, reducedMotion, stagger]
  );

  return (
    <AnimatedListContext.Provider value={contextValue}>
      <motion.div
        className={className}
        variants={listContainer}
        initial="hidden"
        animate="show"
        exit="exit"
        {...rest}
      >
        <AnimatePresence mode="wait" initial={false}>
          {children}
        </AnimatePresence>
      </motion.div>
    </AnimatedListContext.Provider>
  );
};

type AnimatedListItemProps = HTMLAttributes<HTMLDivElement> & {
  index: number;
  pulseKey?: string | number | boolean;
  children: ReactNode;
};

export const AnimatedListItem = ({
  index,
  pulseKey,
  className,
  children,
  ...rest
}: AnimatedListItemProps) => {
  const context = useContext(AnimatedListContext);
  const motionEnabled = useMotionEnabled();
  const reducedMotion = context?.reducedMotion ?? !motionEnabled;
  const stagger = context?.stagger ?? motionTokens.list.stagger;
  const maxStaggerItems = context?.maxStaggerItems ?? motionTokens.list.maxStaggerItems;
  const controls = useAnimationControls();
  const previousPulseRef = useRef(pulseKey);

  const delay = index < maxStaggerItems ? index * stagger : 0;

  useEffect(() => {
    void controls.start("show");
  }, [controls, delay, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    if (previousPulseRef.current !== undefined && previousPulseRef.current !== pulseKey) {
      void controls.start("pulse");
    }
    previousPulseRef.current = pulseKey;
  }, [controls, pulseKey, reducedMotion]);

  return (
    <motion.div
      className={className}
      variants={listItem}
      custom={{ delay, reducedMotion }}
      initial="hidden"
      animate={controls}
      exit="exit"
      {...rest}
    >
      {children}
    </motion.div>
  );
};
