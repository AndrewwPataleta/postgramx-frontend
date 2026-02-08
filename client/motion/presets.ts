import type { Variants } from "framer-motion";
import { motionTokens, msToSeconds } from "./tokens";

export type PageDirection = "forward" | "back" | "modal" | "none";

const baseDuration = msToSeconds(motionTokens.durations.base);
const fastDuration = msToSeconds(motionTokens.durations.fast);
const slowDuration = msToSeconds(motionTokens.durations.slow);

const resolvePageOffset = (direction: PageDirection) => {
  if (direction === "back") {
    return -motionTokens.transforms.pageOffset;
  }
  if (direction === "forward") {
    return motionTokens.transforms.pageOffset;
  }
  return 0;
};

const resolvePageExitOffset = (direction: PageDirection) => {
  if (direction === "back") {
    return motionTokens.transforms.pageExitOffset;
  }
  if (direction === "forward") {
    return -motionTokens.transforms.pageExitOffset;
  }
  return 0;
};

export const pageEnter = (direction: PageDirection, reducedMotion: boolean) => ({
  opacity: reducedMotion ? 1 : 0,
  x: reducedMotion ? 0 : resolvePageOffset(direction),
  scale: reducedMotion || direction !== "modal" ? 1 : motionTokens.transforms.modalScale,
});

export const pageExit = (direction: PageDirection, reducedMotion: boolean) => ({
  opacity: reducedMotion ? 1 : 0,
  x: reducedMotion ? 0 : resolvePageExitOffset(direction),
  scale: reducedMotion || direction !== "modal" ? 1 : motionTokens.transforms.modalScale,
});

export const pageTransition = (reducedMotion: boolean) => ({
  duration: reducedMotion ? 0.1 : baseDuration,
  ease: motionTokens.easing.standard,
});

export const pageExitTransition = (reducedMotion: boolean) => ({
  duration: reducedMotion ? 0.1 : fastDuration,
  ease: motionTokens.easing.exit,
});

export const listContainer: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
  exit: { opacity: 1 },
};

type ListItemCustom = {
  delay: number;
  reducedMotion: boolean;
};

export const listItem: Variants = {
  hidden: ({ reducedMotion }: ListItemCustom) => ({
    opacity: reducedMotion ? 1 : 0,
    y: reducedMotion ? 0 : motionTokens.transforms.listItemOffset,
    scale: 1,
  }),
  show: ({ delay, reducedMotion }: ListItemCustom) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: reducedMotion ? 0.1 : baseDuration,
      ease: motionTokens.easing.standard,
      delay,
    },
  }),
  exit: ({ reducedMotion }: ListItemCustom) => ({
    opacity: reducedMotion ? 1 : 0,
    transition: {
      duration: reducedMotion ? 0.05 : fastDuration,
      ease: motionTokens.easing.exit,
    },
  }),
  pulse: ({ reducedMotion }: ListItemCustom) => ({
    scale: reducedMotion ? 1 : [1, 1.01, 1],
    transition: {
      duration: reducedMotion ? 0.1 : fastDuration,
      ease: motionTokens.easing.standard,
    },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: baseDuration, ease: motionTokens.easing.standard },
  },
  exit: {
    opacity: 0,
    transition: { duration: fastDuration, ease: motionTokens.easing.exit },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: motionTokens.transforms.modalScale },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: slowDuration, ease: motionTokens.easing.standard },
  },
  exit: {
    opacity: 0,
    scale: motionTokens.transforms.modalScale,
    transition: { duration: fastDuration, ease: motionTokens.easing.exit },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: motionTokens.transforms.pageOffset },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: baseDuration, ease: motionTokens.easing.standard },
  },
  exit: {
    opacity: 0,
    x: -motionTokens.transforms.pageExitOffset,
    transition: { duration: fastDuration, ease: motionTokens.easing.exit },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -motionTokens.transforms.pageOffset },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: baseDuration, ease: motionTokens.easing.standard },
  },
  exit: {
    opacity: 0,
    x: motionTokens.transforms.pageExitOffset,
    transition: { duration: fastDuration, ease: motionTokens.easing.exit },
  },
};

// Use these presets in PageTransition and AnimatedList for consistent motion across pages and lists.
