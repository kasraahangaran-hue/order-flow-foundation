import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface PricingLinkProps {
  label: string;
  onPress: () => void;
  className?: string;
}

export function PricingLink({ label, onPress, className }: PricingLinkProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        haptics.light();
        onPress();
      }}
      className={cn(
        "press-effect mt-0.5 inline-flex text-xs font-normal leading-tight text-washmen-primary underline underline-offset-2",
        className
      )}
    >
      {label}
    </button>
  );
}