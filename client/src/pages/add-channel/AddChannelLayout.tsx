import { X } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SafeAreaLayout from "@/components/telegram/SafeAreaLayout";
import { cn } from "@/lib/utils";
import { AddChannelFlowProvider } from "@/pages/add-channel/useAddChannelFlow";
import { PageContainer } from "@/components/layout/PageContainer";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ROUTES } from "@/constants/routes";

const AddChannelLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const stepMatch = location.pathname.match(/step-(\d+)/);
  const stepNumber = stepMatch ? Number(stepMatch[1]) : null;
  const stepLabel = stepNumber ? t("channels.add.stepLabel", { current: stepNumber, total: 3 }) : null;

  return (
    <AddChannelFlowProvider>
      <SafeAreaLayout className="flex min-h-screen flex-col bg-background">
        <header
          className={cn(
            "sticky top-0 z-30 border-b border-border/50 bg-background/90 backdrop-blur-glass"
          )}
        >
          <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {t("channels.add.title")}
              </p>
              {stepLabel ? (
                <p className="text-[10px] font-medium text-muted-foreground">
                  {stepLabel}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.CHANNELS, { replace: true })}
              className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              aria-label={t("common.close")}
            >
              <X size={18} />
            </button>
          </div>
        </header>
        <PageContainer className="mx-auto flex w-full max-w-2xl flex-1 flex-col pt-4 pb-12">
          <Outlet />
        </PageContainer>
      </SafeAreaLayout>
    </AddChannelFlowProvider>
  );
};

export default AddChannelLayout;
