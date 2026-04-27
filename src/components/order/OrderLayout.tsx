import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

interface OrderLayoutProps {
  title: string;
  step?: 1 | 2 | 3;
  totalSteps?: number;
  onBack?: () => void;
  footerSlot?: ReactNode;
  supportSlot?: ReactNode;
  children?: ReactNode;
}

export function OrderLayout({
  title,
  step,
  totalSteps = 3,
  onBack,
  footerSlot,
  supportSlot,
  children,
}: OrderLayoutProps) {
  const showProgress = typeof step === "number";

  return (
    <div className="flex h-full min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[24px] font-bold leading-tight tracking-tight text-washmen-secondary-900">
            {title}
          </h1>
          {supportSlot ? <div className="shrink-0">{supportSlot}</div> : null}
        </div>

        {showProgress && (
          <div
            className="mt-2 flex w-full max-w-[260px] gap-[2px]"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-valuenow={step}
            aria-label={`Step ${step} of ${totalSteps}`}
          >
            {Array.from({ length: totalSteps }).map((_, i) => {
              const idx = i + 1;
              const isActive = idx === step;
              const isCompleted = idx < step!;
              return (
                <span
                  key={i}
                  className={cn(
                    "h-[3px] flex-1 rounded-full transition-colors",
                    isActive && "bg-washmen-orange",
                    isCompleted && "bg-washmen-orange/60",
                    !isActive && !isCompleted && "bg-washmen-secondary-200"
                  )}
                />
              );
            })}
          </div>
        )}
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 pb-4">{children}</main>

      {/* Footer */}
      {footerSlot !== undefined && (
        <footer
          className="sticky bottom-0 z-10 border-t border-washmen-secondary-100 bg-background px-4 pt-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
        >
          <div className="flex items-stretch gap-3">
            {onBack && (
              <button
                type="button"
                aria-label="Go back"
                onClick={() => {
                  haptics.light();
                  onBack();
                }}
                className="press-effect flex h-14 w-14 items-center justify-center rounded-btn border-2 border-washmen-primary text-washmen-primary"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
              </button>
            )}
            <div className="flex-1">{footerSlot}</div>
          </div>
        </footer>
      )}
    </div>
  );
}

/** Standard primary CTA used in the footer. */
export function OrderPrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        haptics.medium();
        onClick?.();
      }}
      className={cn(
        "press-effect flex h-14 w-full items-center justify-center rounded-btn bg-washmen-primary px-6 text-base font-semibold text-primary-foreground",
        "disabled:opacity-50 disabled:active:scale-100 disabled:active:opacity-50"
      )}
    >
      {children}
    </button>
  );
}