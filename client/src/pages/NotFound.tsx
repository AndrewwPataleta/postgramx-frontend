import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES } from "@/constants/routes";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-12 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-semibold text-primary">?</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          This page doesn't exist yet
        </p>
        <p className="text-sm text-muted-foreground mb-8 bg-secondary/30 p-4 rounded-lg">
          Continue chatting with us to generate this page, or return to the main app.
        </p>
        <Link
          to={ROUTES.MARKETPLACE}
          className="button-primary text-center py-3 px-8 font-semibold w-full max-w-xs"
        >
          Return to Marketplace
        </Link>
      </PageContainer>
    </div>
  );
};

export default NotFound;
