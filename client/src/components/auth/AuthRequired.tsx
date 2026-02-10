import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ROUTES } from "@/constants/routes";

const AuthRequired = () => {
  const { t } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="glass flex flex-col items-center gap-3 px-6 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <ShieldAlert size={22} />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("auth.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("auth.description")}
          </p>
        </div>
        <p className="text-xs text-muted-foreground/70">
          {t("auth.marketplaceHint")}
        </p>
        <Button asChild className="mt-2">
          <Link to={ROUTES.MARKETPLACE}>{t("auth.marketplaceCta")}</Link>
        </Button>
      </div>
    </div>
  );
};

export default AuthRequired;
