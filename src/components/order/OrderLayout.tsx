import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

interface OrderLayoutProps {
  title: string;
  step?: 1 | 2 | 3 | 4;
  totalSteps?: number;
  onBack?: () => void;
  footerSlot?: ReactNode;
  /**
   * Content that renders above the back+CTA row inside the same sticky
   * footer band. Used for the tip selector on Last Step. Spans the full
   * width of the band content area (327px gutter-aligned).
   */
  footerAboveSlot?: ReactNode;
  supportSlot?: ReactNode;
  children?: ReactNode;
}

export function OrderLayout({
  title,
  step,
  totalSteps = 4,
  onBack,
  footerSlot,
  footerAboveSlot,
  supportSlot,
  children,
}: OrderLayoutProps) {
  const showProgress = typeof step === "number";

  return (
    <div className="flex h-full min-h-screen flex-col bg-subtle-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-subtle-bg px-6 pt-[max(env(safe-area-inset-top),24px)] pb-0">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold text-washmen-primary">
            {title}
          </h1>
          {supportSlot ? <div className="shrink-0">{supportSlot}</div> : null}
        </div>

        {showProgress && (
          <div
            className="mt-6 flex w-full gap-1"
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
                    "h-[2px] flex-1 rounded-full transition-colors",
                    isActive && "bg-washmen-orange",
                    isCompleted && "bg-washmen-orange",
                    !isActive && !isCompleted && "bg-washmen-secondary-200"
                  )}
                />
              );
            })}
          </div>
        )}
      </header>

      {/* Scrollable content */}
      <main className="no-scrollbar flex-1 overflow-y-auto px-6 pb-4 pt-[26px]">{children}</main>

      {/* Footer */}
      {footerSlot !== undefined && (
        <footer
          className="sticky bottom-0 z-10 bg-washmen-secondary-express pb-[max(env(safe-area-inset-bottom),1rem)] shadow-[0px_-1px_8px_rgba(0,0,0,0.06)]"
        >
          {footerAboveSlot && (
            <div className="px-6 pt-4">
              {footerAboveSlot}
            </div>
          )}
          <div className="flex items-center gap-2 px-6 pt-3 pb-4">
            {onBack && (
              <button
                type="button"
                aria-label="Go back"
                onClick={() => {
                  haptics.light();
                  onBack();
                }}
                className="press-effect flex w-12 h-[42px] shrink-0 items-center justify-center rounded-[8px] border border-primary bg-background text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            {footerSlot}
          </div>
        </footer>
      )}
    </div>
  );
}