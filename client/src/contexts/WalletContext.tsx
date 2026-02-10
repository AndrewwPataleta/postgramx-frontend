import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTonAddress, useTonWallet } from "@tonconnect/ui-react";

type WalletNetwork = "mainnet" | "testnet";

interface WalletContextValue {
  walletAddress: string | null;
  walletAppName: string | null;
  network: WalletNetwork | null;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const wallet = useTonWallet();
  const walletAddress = useTonAddress(true);
  const [contextValue, setContextValue] = useState<WalletContextValue>({
    walletAddress: null,
    walletAppName: null,
    network: null,
    isConnected: false,
  });

  const derived = useMemo<WalletContextValue>(() => {
    if (!wallet) {
      return {
        walletAddress: null,
        walletAppName: null,
        network: null,
        isConnected: false,
      };
    }

    const chainValue = String(wallet.account.chain).toLowerCase();
    const isTestnet = chainValue.includes("test") || chainValue === "-239";
    return {
      walletAddress: walletAddress || wallet.account.address,
      walletAppName: wallet.device.appName ?? wallet.device.platform ?? null,
      network: isTestnet ? "testnet" : "mainnet",
      isConnected: true,
    };
  }, [wallet, walletAddress]);

  useEffect(() => {
    setContextValue(derived);
  }, [derived]);

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
};

export const useWalletContext = () => {
  const value = useContext(WalletContext);
  if (!value) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return value;
};
