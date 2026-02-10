import { ReactNode } from "react";

interface FlowLayoutProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  footerMode?: "fixed" | "sticky";
  footerPaddingClassName?: string;
}

export default function FlowLayout({
  title,
  children,
  footer,
  footerMode = "fixed",
  footerPaddingClassName = "pb-[calc(104px+var(--tg-content-safe-area-inset-bottom))]",
}: FlowLayoutProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`px-4 pt-4 ${footer ? footerPaddingClassName : "pb-6"}`}>
        <h1 className="mb-3 text-base font-semibold text-foreground">{title}</h1>
        {children}
        {footer && footerMode === "sticky" ? (
          <div
            className="sticky z-20 mt-3"
            style={{
              bottom: "calc(var(--tg-content-safe-area-inset-bottom) + 12px)",
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>

      {footer && footerMode === "fixed" ? (
        <div
          className="fixed left-0 right-0 z-30"
          style={{
            bottom: "calc(var(--tg-content-safe-area-inset-bottom) + 12px)",
          }}
        >
          <div className="mx-auto w-full max-w-2xl px-4">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}
