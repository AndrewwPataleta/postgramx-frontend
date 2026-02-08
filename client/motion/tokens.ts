export const motionTokens = {
  durations: {
    fast: 120,
    base: 180,
    slow: 220,
  },
  easing: {
    standard: [0.2, 0.8, 0.2, 1],
    exit: [0.4, 0, 1, 1],
  },
  transforms: {
    pageOffset: 14,
    pageExitOffset: 10,
    listItemOffset: 8,
    modalScale: 0.98,
  },
  list: {
    stagger: 0.02,
    maxStaggerItems: 12,
  },
};

export const msToSeconds = (ms: number) => ms / 1000;
