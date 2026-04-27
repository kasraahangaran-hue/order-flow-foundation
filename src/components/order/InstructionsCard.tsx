import type { ComponentType } from "react";
import { Pencil, Plus } from "lucide-react";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface InstructionsCardProps {
  title: string;
  icon: ComponentType<{ className?: string }>;
  valueLabel?: string | null;
  onPress: () => void;
}

export function InstructionsCard({
  title,
  icon: Icon,
  valueLabel,
  onPress,
}: InstructionsCardProps) {
  const hasValue = !!valueLabel;
  const ActionIcon = hasValue ? Pencil : Plus;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        haptics.light();
        onPress();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          haptics.light();
          onPress();
        }
      }}
      className="press-effect w-full rounded-card bg-card p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-washmen-secondary-aqua">
            <Icon className="h-4 w-4 text-washmen-primary" />
          </div>
          <p className="text-base font-semibold text-washmen-secondary-900">{title}</p>
        </div>
        <ActionIcon
          className={cn("h-5 w-5 text-washmen-primary")}
          strokeWidth={2}
          aria-hidden
        />
      </div>
      {hasValue ? (
        <p className="mt-2 pl-11 text-base text-washmen-secondary-700">{valueLabel}</p>
      ) : null}
    </div>
  );
}