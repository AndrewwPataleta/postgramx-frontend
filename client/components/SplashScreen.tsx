import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface SplashScreenProps {
  onComplete: () => void;
}

const STEP_DURATION_MS = 100;

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  const steps = useMemo(
    () => [
      {
        title: t("splash.loadingTitle"),
        subtitle: t("splash.loadingSubtitle"),
      },
      {
        title: t("splash.visualsTitle"),
        subtitle: t("splash.visualsSubtitle"),
      },
      {
        title: t("splash.modulesTitle"),
        subtitle: t("splash.modulesSubtitle"),
      },
    ],
    [t]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, STEP_DURATION_MS);

    const timeoutId = window.setTimeout(() => {
      onComplete();
    }, steps.length * STEP_DURATION_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [onComplete, steps.length]);

  const step = steps[activeStep];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/80 via-accent/80 to-primary/60 blur-2xl opacity-90 animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-primary/40 animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-6 rounded-full border border-accent/30 animate-[spin_6s_linear_infinite_reverse]" />
          <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
            <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-primary/70 shadow-[0_0_12px_hsl(var(--primary)/0.6)]" />
          </div>
          <div className="absolute inset-0 animate-[spin_12s_linear_infinite_reverse]">
            <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent/70 shadow-[0_0_10px_hsl(var(--accent)/0.6)]" />
          </div>
          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary via-accent to-primary p-0.5 shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
            <img
              src="/logo.png"
              alt="PostgramX logo"
              className="h-full w-full rounded-full bg-background object-cover"
            />
          </div>
        </div>

        <div key={step.title} className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <p className="text-lg font-semibold tracking-wide">{step.title}</p>
          <p className="text-sm text-muted-foreground">{step.subtitle}</p>
        </div>

        <div className="text-xs tracking-[0.3em] text-muted-foreground">
          {t("splash.entering")}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
