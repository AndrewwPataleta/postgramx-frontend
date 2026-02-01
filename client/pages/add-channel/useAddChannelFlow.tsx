import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ChannelPreview } from "@/api/features/channelsApi";

export type AddChannelFlowStatus = "idle" | "loading" | "success" | "error";

export type AddChannelFlowState = {
  usernameOrLink: string;
  normalizedUsername: string;
  preview: ChannelPreview | null;
  linkedChannelId: string | null;
  linkStatus: AddChannelFlowStatus;
  verifyStatus: AddChannelFlowStatus;
  lastError: string | null;
};

type AddChannelFlowContextValue = {
  state: AddChannelFlowState;
  setUsernameOrLink: (value: string) => void;
  setPreview: (value: ChannelPreview | null) => void;
  setLinkedChannelId: (value: string | null) => void;
  setLinkStatus: (value: AddChannelFlowStatus) => void;
  setVerifyStatus: (value: AddChannelFlowStatus) => void;
  setLastError: (value: string | null) => void;
  resetFlow: () => void;
};

const USERNAME_KEY = "addChannel.usernameOrLink";
const PREVIEW_KEY = "addChannel.preview";
const CHANNEL_ID_KEY = "addChannel.channelId";

const DEFAULT_STATE: AddChannelFlowState = {
  usernameOrLink: "",
  normalizedUsername: "",
  preview: null,
  linkedChannelId: null,
  linkStatus: "idle",
  verifyStatus: "idle",
  lastError: null,
};

const readSessionValue = (key: string) => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const readSessionJson = <T,>(key: string): T | null => {
  const raw = readSessionValue(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const AddChannelFlowContext = createContext<AddChannelFlowContextValue | undefined>(undefined);

export const AddChannelFlowProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AddChannelFlowState>(() => {
    const usernameOrLink = readSessionValue(USERNAME_KEY) ?? DEFAULT_STATE.usernameOrLink;
    const preview = readSessionJson<ChannelPreview>(PREVIEW_KEY);
    const linkedChannelId = readSessionValue(CHANNEL_ID_KEY);
    const normalizedUsername =
      preview?.normalizedUsername ?? preview?.username ?? DEFAULT_STATE.normalizedUsername;

    return {
      ...DEFAULT_STATE,
      usernameOrLink,
      preview,
      linkedChannelId,
      normalizedUsername,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      if (state.usernameOrLink) {
        window.sessionStorage.setItem(USERNAME_KEY, state.usernameOrLink);
      } else {
        window.sessionStorage.removeItem(USERNAME_KEY);
      }
    } catch {
      return;
    }
  }, [state.usernameOrLink]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      if (state.preview) {
        window.sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(state.preview));
      } else {
        window.sessionStorage.removeItem(PREVIEW_KEY);
      }
    } catch {
      return;
    }
  }, [state.preview]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      if (state.linkedChannelId) {
        window.sessionStorage.setItem(CHANNEL_ID_KEY, state.linkedChannelId);
      } else {
        window.sessionStorage.removeItem(CHANNEL_ID_KEY);
      }
    } catch {
      return;
    }
  }, [state.linkedChannelId]);

  const contextValue = useMemo<AddChannelFlowContextValue>(
    () => ({
      state,
      setUsernameOrLink: (value) => setState((prev) => ({ ...prev, usernameOrLink: value })),
      setPreview: (value) =>
        setState((prev) => ({
          ...prev,
          preview: value,
          normalizedUsername: value?.normalizedUsername ?? value?.username ?? "",
        })),
      setLinkedChannelId: (value) => setState((prev) => ({ ...prev, linkedChannelId: value })),
      setLinkStatus: (value) => setState((prev) => ({ ...prev, linkStatus: value })),
      setVerifyStatus: (value) => setState((prev) => ({ ...prev, verifyStatus: value })),
      setLastError: (value) => setState((prev) => ({ ...prev, lastError: value })),
      resetFlow: () => setState(DEFAULT_STATE),
    }),
    [state],
  );

  return (
    <AddChannelFlowContext.Provider value={contextValue}>
      {children}
    </AddChannelFlowContext.Provider>
  );
};

export const useAddChannelFlow = () => {
  const context = useContext(AddChannelFlowContext);
  if (!context) {
    throw new Error("useAddChannelFlow must be used within AddChannelFlowProvider");
  }
  return context;
};
