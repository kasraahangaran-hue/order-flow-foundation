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
  supportSlot?: ReactNode;
  children?: ReactNode;
}

export function OrderLayout({
  title,
  step,
  totalSteps = 4,
  onBack,
  footerSlot,
  supportSlot,
  children,
}: OrderLayoutProps) {
  const showProgress = typeof step === "number";

  return (
    <div className="flex h-full min-h-screen flex-col bg-subtle-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-subtle-bg px-4 pt-6 pb-0">
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
      <main className="flex-1 overflow-y-auto px-4 pb-4 pt-[26px]">{children}</main>

      {/* Footer */}
      {footerSlot !== undefined && (
        <footer
          className="sticky bottom-0 z-10 bg-washmen-primary-light px-4 py-4"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
        >
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                aria-label="Go back"
                onClick={() => {
                  haptics.light();
                  onBack();
                }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-primary bg-background text-primary transition-transform active:scale-95"
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