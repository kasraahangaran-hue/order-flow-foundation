import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  /** Future: snap points like ['auto', '50%', '90%']. Currently visual only. */
  snapPoints?: Array<"auto" | string>;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" aria-modal role="dialog">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close sheet"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-washmen-secondary-900/40"
      />

      {/* Sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 max-h-[90vh] animate-sheet-in overflow-hidden rounded-t-sheet bg-background",
          "shadow-[0_-8px_32px_rgba(16,24,40,0.16)]"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-washmen-secondary-300" />
        </div>

        {title && (
          <div className="px-4 pb-3">
            <h2 className="text-lg font-semibold text-washmen-secondary-900">
              {title}
            </h2>
          </div>
        )}

        <div className="max-h-[calc(90vh-72px)] overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}