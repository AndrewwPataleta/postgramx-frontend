import type { HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { pageEnter, pageExit, pageExitTransition, pageTransition, type PageDirection } from "./presets";
import { useMotionEnabled } from "./MotionProvider";

export type PageTransitionProps = HTMLAttributes<HTMLDivElement> & {
  direction?: PageDirection;
  presentation?: "default" | "modal";
};

export const PageTransition = ({
  direction = "none",
  presentation = "default",
  children,
  className,
  ...rest
}: PageTransitionProps) => {
  const motionEnabled = useMotionEnabled();
  const reducedMotion = !motionEnabled;
  const resolvedDirection = presentation === "modal" ? "modal" : direction;

  return (
    <motion.div
      className={className}
      style={{ position: "relative", width: "100%" }}
      initial={pageEnter(resolvedDirection, reducedMotion)}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={pageExit(resolvedDirection, reducedMotion)}
      transition={{
        ...pageTransition(reducedMotion),
        exit: pageExitTransition(reducedMotion),
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
