import type { ComponentType } from "react";
import { Pencil, Plus } from "lucide-react";
import { haptics } from "@/lib/haptics";

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
      className="press-effect w-full rounded-[8px] bg-white border border-[#f2f3f8] px-4 py-[10px] text-left"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
          <Icon className="h-6 w-6 text-washmen-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-normal leading-[20px] tracking-[0.1px] text-washmen-primary">{title}</p>
          {hasValue ? (
            <p className="mt-1 text-[12px] font-light leading-[18px] tracking-[0.1px] text-[#585871]">{valueLabel}</p>
          ) : null}
        </div>
        <ActionIcon className="h-4 w-4 shrink-0 text-washmen-primary" strokeWidth={2} aria-hidden />
      </div>
    </div>
  );
}