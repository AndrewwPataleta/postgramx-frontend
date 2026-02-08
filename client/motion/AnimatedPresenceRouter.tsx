import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { PageTransition } from "./PageTransition";
import type { PageDirection } from "./presets";

export type AnimatedPresenceRouterProps = {
  children: ReactNode;
};

type LocationState = {
  idx?: number;
  presentation?: "modal";
} | null;

export const AnimatedPresenceRouter = ({ children }: AnimatedPresenceRouterProps) => {
  const location = useLocation();
  const [direction, setDirection] = useState<PageDirection>("none");
  const previousIndexRef = useRef<number | null>(null);

  const presentation = (location.state as LocationState)?.presentation ?? "default";

  useEffect(() => {
    const locationState = location.state as LocationState;
    const nextIndex = typeof locationState?.idx === "number" ? locationState.idx : null;

    if (nextIndex !== null && previousIndexRef.current !== null) {
      setDirection(nextIndex < previousIndexRef.current ? "back" : "forward");
    } else {
      setDirection("none");
    }

    if (nextIndex !== null) {
      previousIndexRef.current = nextIndex;
    }
  }, [location.key, location.state]);

  const routeKey = useMemo(() => location.pathname + location.search, [location.pathname, location.search]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={routeKey} direction={direction} presentation={presentation}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
};
