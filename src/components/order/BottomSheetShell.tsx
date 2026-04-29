import type { ReactNode } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BottomSheetFooterVariant = "single" | "split" | "none";

interface BottomSheetShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  footerVariant?: BottomSheetFooterVariant;
  /** Single-CTA label (footerVariant="single") */
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  /** Split footer secondary action (footerVariant="split") */
  secondaryLabel?: string;
  onSecondary?: () => void;
  className?: string;
  bodyClassName?: string;
}

/**
 * Reusable bottom-sheet shell used by all instruction sub-sheets.
 * Provides a consistent header, scrollable body and pinned footer.
 */
export function BottomSheetShell({
  open,
  onOpenChange,
  title,
  children,
  footerVariant = "single",
  primaryLabel = "Done",
  onPrimary,
  primaryDisabled = false,
  secondaryLabel = "Clear",
  onSecondary,
  className,
  bodyClassName,
}: BottomSheetShellProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "max-h-[90vh] rounded-t-sheet border-0 bg-background",
          className,
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex max-h-[90vh] flex-col">
          {title ? (
            <div className="px-6 pt-5 pb-3">
              <h2 className="text-[18px] font-bold leading-tight text-washmen-primary">
                {title}
              </h2>
            </div>
          ) : (
            <div className="pt-3" />
          )}

          <div
            className={cn(
              "no-scrollbar flex-1 overflow-y-auto px-6 pb-4",
              bodyClassName,
            )}
          >
            {children}
          </div>

          {footerVariant !== "none" ? (
            <div className="border-t border-border/60 bg-background px-6 pt-4 pb-5">
              {footerVariant === "single" ? (
                <Button
                  className="h-12 w-full rounded-btn text-[15px] font-semibold"
                  onClick={() => {
                    onPrimary?.();
                    if (!onPrimary) onOpenChange(false);
                  }}
                  disabled={primaryDisabled}
                >
                  {primaryLabel}
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="h-12 flex-1 rounded-btn text-[15px] font-semibold"
                    onClick={() => onSecondary?.()}
                  >
                    {secondaryLabel}
                  </Button>
                  <Button
                    className="h-12 flex-1 rounded-btn text-[15px] font-semibold"
                    onClick={() => {
                      onPrimary?.();
                      if (!onPrimary) onOpenChange(false);
                    }}
                    disabled={primaryDisabled}
                  >
                    {primaryLabel}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}