import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type FooterVariant = "apply-only" | "back-and-apply" | "dual-apply";

interface BottomSheetShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  titleSlot?: ReactNode;
  children: ReactNode;
  footer: FooterVariant;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onBack?: () => void;
  primaryDisabled?: boolean;
}

export function BottomSheetShell({
  open,
  onOpenChange,
  title,
  titleSlot,
  children,
  footer,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onBack,
  primaryDisabled = false,
}: BottomSheetShellProps) {
  const fire = (cb?: () => void) => {
    haptics.light();
    cb?.();
  };

  const primaryBtnClass = cn(
    "h-[42px] w-full rounded-[6px] bg-washmen-primary text-white text-[14px] font-medium hover:bg-washmen-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="max-h-[92vh] rounded-t-[24px] border-0 bg-white"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex flex-col max-h-[92vh]">
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[20px] font-bold leading-[24px] tracking-[0.4px] text-washmen-primary">
                {title}
              </h2>
              {titleSlot}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-4">
            {children}
          </div>

          <div className="px-6 pt-3 pb-4">
            {footer === "apply-only" && (
              <button
                type="button"
                className={primaryBtnClass}
                onClick={() => fire(onPrimary)}
                disabled={primaryDisabled}
              >
                {primaryLabel ?? "Apply"}
              </button>
            )}

            {footer === "back-and-apply" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fire(onBack ?? (() => onOpenChange(false)))}
                  className="w-12 h-[42px] rounded-[6px] bg-white border border-washmen-primary flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 text-washmen-primary" />
                </button>
                <button
                  type="button"
                  className={primaryBtnClass}
                  onClick={() => fire(onPrimary)}
                  disabled={primaryDisabled}
                >
                  {primaryLabel ?? "Apply"}
                </button>
              </div>
            )}

            {footer === "dual-apply" && (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className={primaryBtnClass}
                  onClick={() => fire(onPrimary)}
                  disabled={primaryDisabled}
                >
                  {primaryLabel ?? "Apply on this Order Only"}
                </button>
                <button
                  type="button"
                  className={primaryBtnClass}
                  onClick={() => fire(onSecondary)}
                  disabled={primaryDisabled}
                >
                  {secondaryLabel ?? "Apply on All Future Orders"}
                </button>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}