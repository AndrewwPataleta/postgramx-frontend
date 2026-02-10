import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Store, TrendingUp, User, Zap } from "lucide-react";
import TopToolbar from "@/components/TopToolbar";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ROUTES } from "@/constants/routes";

const mainNavPaths = [ROUTES.MARKETPLACE, ROUTES.DEALS, ROUTES.CHANNELS, ROUTES.PROFILE];

const AppShell = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionsRef = useRef<Map<string, number>>(new Map());
  const lastPathRef = useRef(location.pathname);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const { t } = useLanguage();

  const isMainNavRoute = mainNavPaths.includes(location.pathname);
  const shouldHideBottomNav =
    !isMainNavRoute || (location.pathname === ROUTES.MARKETPLACE && isKeyboardOpen);
  const bottomNavOffset = 8;
  const bottomNavHeight = shouldHideBottomNav ? 0 : 104 + bottomNavOffset;
  const isAddChannelRoute = location.pathname.startsWith(ROUTES.ADD_CHANNEL);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navItems = useMemo(
    () => [
      { path: ROUTES.MARKETPLACE, label: t("nav.marketplace"), icon: Store },
      { path: ROUTES.DEALS, label: t("nav.deals"), icon: TrendingUp },
      { path: ROUTES.CHANNELS, label: t("nav.channels"), icon: Zap },
      { path: ROUTES.PROFILE, label: t("nav.profile"), icon: User },
    ],
    [t],
  );

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) {
      return;
    }

    const previousPath = lastPathRef.current;
    if (previousPath !== location.pathname) {
      scrollPositionsRef.current.set(previousPath, mainElement.scrollTop);
    }

    const savedScrollTop = scrollPositionsRef.current.get(location.pathname) ?? 0;

    requestAnimationFrame(() => {
      mainElement.scrollTo({ top: savedScrollTop, behavior: "auto" });
    });

    lastPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== ROUTES.MARKETPLACE) {
      setIsKeyboardOpen(false);
      return;
    }

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        setIsKeyboardOpen(false);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, [location.pathname]);

  const shellStyle: CSSProperties = {
    "--bottom-nav-height": `${bottomNavHeight}px`,
    "--app-toolbar-height": isAddChannelRoute ? "0px" : "52px",
  } as CSSProperties;

  const contentStyle: CSSProperties = isAddChannelRoute
    ? {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      }
    : {
        paddingTop:
          "calc(max(var(--tg-safe-top), var(--tg-content-safe-area-inset-top)) + var(--app-toolbar-height))",
        paddingBottom:
          "calc(max(var(--tg-safe-bottom), var(--tg-content-safe-area-inset-bottom)) + var(--bottom-nav-height))",
        paddingLeft: "max(var(--tg-safe-left), var(--tg-content-safe-area-inset-left))",
        paddingRight: "max(var(--tg-safe-right), var(--tg-content-safe-area-inset-right))",
      };

  return (
    <div className="flex h-full flex-col bg-background" style={shellStyle}>
      {isAddChannelRoute ? null : <TopToolbar />}
      <main className="flex-1 overflow-y-auto touch-pan-y" ref={mainRef} style={contentStyle}>
        <Outlet />
      </main>

      <nav
        className={`fixed bottom-[calc(var(--tg-content-safe-area-inset-bottom)+8px)] left-0 right-0 z-50 px-4 ${
          shouldHideBottomNav ? "hidden" : ""
        }`}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-around rounded-2xl border border-border/40 bg-card/80 shadow-sm backdrop-blur-glass">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-3 py-3 transition-colors focus-visible:outline-none focus-visible:bg-primary/10 ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                <Icon size={22} />
                <span className="max-w-full truncate whitespace-nowrap text-[10px] font-medium leading-none">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
