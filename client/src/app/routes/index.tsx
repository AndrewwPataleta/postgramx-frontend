import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PageLoader from "@/design-system/components/PageLoader";
import { ROUTES } from "@app/routes/paths";

const Splash = lazy(() => import("@pages/Splash"));
const NotFound = lazy(() => import("@pages/NotFound"));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route index element={<Navigate to={ROUTES.SPLASH} replace />} />
        <Route path={ROUTES.SPLASH} element={<Splash />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
