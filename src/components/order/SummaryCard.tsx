import { ChevronDown, Pencil } from "lucide-react";
import { ComponentType, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

interface SummaryCardProps {
  title: string;
  children?: ReactNode;
  onEdit?: () => void;
  collapsible?: boolean;
  defaultOpen?: boolean;
  icon?: ComponentType<{ className?: string }>;
}

export function SummaryCard({
  title,
  children,
  onEdit,
  collapsible = false,
  defaultOpen = true,
  icon: Icon,
}: SummaryCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = collapsible ? open : true;

  return (
    <div className="rounded-card bg-card p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-washmen-primary-light">
            <Icon className="h-4 w-4 text-washmen-primary" />
          </div>
        )}
        <h3 className="flex-1 text-base font-semibold text-washmen-primary">
          {title}
        </h3>
        {onEdit && !collapsible && (
          <button
            type="button"
            aria-label="Edit"
            onClick={() => {
              haptics.light();
              onEdit();
            }}
            className="press-effect flex h-8 w-8 items-center justify-center rounded-full text-washmen-secondary-500"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {collapsible && (
          <button
            type="button"
            aria-label={isOpen ? "Collapse" : "Expand"}
            onClick={() => {
              haptics.light();
              setOpen((v) => !v);
            }}
            className="press-effect flex h-8 w-8 items-center justify-center rounded-full text-washmen-secondary-500"
          >
            <ChevronDown
              className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")}
            />
          </button>
        )}
      </div>
      {isOpen && children && <div className="mt-3">{children}</div>}
    </div>
  );
}