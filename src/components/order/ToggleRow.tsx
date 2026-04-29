import type { ReactNode, CSSProperties } from "react";
import { Switch } from "@/components/ui/switch";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: ReactNode;
  labelMedium?: boolean;
}

export function ToggleRow({
  label,
  checked,
  onCheckedChange,
  icon,
  labelMedium = false,
}: ToggleRowProps) {
  return (
    <div className="flex items-center gap-4 py-2">
      {icon}
      <span
        className={cn(
          "flex-1 text-[14px] leading-[20px] text-washmen-primary",
          labelMedium ? "font-medium" : "font-light"
        )}
      >
        {label}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={(v) => {
          haptics.light();
          onCheckedChange(v);
        }}
        style={{ "--switch-thumb-x": "1.625rem" } as CSSProperties}
        className="h-6 w-[50px] data-[state=checked]:bg-washmen-primary data-[state=unchecked]:bg-washmen-secondary-300"
      />
    </div>
  );
}