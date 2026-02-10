import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@shared/api/queryClient";
import { useState } from "react";

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => createQueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
