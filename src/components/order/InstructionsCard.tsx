import type { ComponentType } from "react";
import { Pencil, Plus } from "lucide-react";
import { haptics } from "@/lib/haptics";
import type { AutoApprovalsSummaryLine } from "@/lib/orderInstructionsLabels";

interface InstructionsCardProps {
  title: string;
  icon: ComponentType<{ className?: string }>;
  value?: string | AutoApprovalsSummaryLine[] | null;
  onPress: () => void;
}

export function InstructionsCard({
  title,
  icon: Icon,
  value,
  onPress,
}: InstructionsCardProps) {
  const hasValue =
    typeof value === "string"
      ? value.length > 0
      : Array.isArray(value)
        ? value.length > 0
        : false;
  const ActionIcon = hasValue ? Pencil : Plus;
  const isMultiLine = Array.isArray(value);

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
      <div className={`flex gap-2 ${isMultiLine && hasValue ? "items-start" : "items-center"}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
          <Icon className="h-6 w-6 text-washmen-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[14px] font-normal leading-[20px] tracking-[0.1px] text-washmen-primary">
              {title}
            </p>
            <ActionIcon className="h-4 w-4 shrink-0 text-washmen-primary" strokeWidth={2} aria-hidden />
          </div>
          {hasValue && !isMultiLine ? (
            <p className="mt-1 text-[12px] font-light leading-[18px] tracking-[0.1px] text-[#585871]">
              {value as string}
            </p>
          ) : null}
          {hasValue && isMultiLine ? (
            <div className="mt-1 flex flex-col gap-1">
              {(value as AutoApprovalsSummaryLine[]).map((line, i) => (
                <p
                  key={i}
                  className="text-[12px] leading-[18px] tracking-[0.1px] text-[#585871]"
                >
                  <span className="font-medium">{line.prefix}</span>{" "}
                  <span className="font-light">{line.suffix}</span>
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}