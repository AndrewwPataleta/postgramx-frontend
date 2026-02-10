import { ReactNode } from "react";
import { useTelegram } from "@/hooks/use-telegram";
import AuthRequired from "@/components/auth/AuthRequired";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated } = useTelegram();

  if (!isAuthenticated) {
    return <AuthRequired />;
  }

  return <>{children}</>;
};

export default RequireAuth;
