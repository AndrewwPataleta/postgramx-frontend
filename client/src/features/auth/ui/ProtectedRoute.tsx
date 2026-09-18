import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { ROUTES } from "@/constants/routes";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isReady, user } = useAuth();
  const location = useLocation();

  if (!isReady || !user) {
    return (
      <Navigate
        to={ROUTES.SPLASH}
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
