import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { useReducedMotion } from "./useReducedMotion";

type MotionContextValue = {
  reducedMotion: boolean;
  motionEnabled: boolean;
};

const MotionContext = createContext<MotionContextValue>({
  reducedMotion: false,
  motionEnabled: true,
});

export const MotionProvider = ({ children }: { children: ReactNode }) => {
  const reducedMotion = useReducedMotion();

  return (
    <MotionContext.Provider
      value={{
        reducedMotion,
        motionEnabled: !reducedMotion,
      }}
    >
      {children}
    </MotionContext.Provider>
  );
};

export const useMotionEnabled = () => useContext(MotionContext).motionEnabled;
export const useMotionSettings = () => useContext(MotionContext);
