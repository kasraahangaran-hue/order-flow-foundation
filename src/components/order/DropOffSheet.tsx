import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface DropOffSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SlotOption {
  time: string;
  surcharge?: number;
}

interface DaySlots {
  date: string;
  label: string;
  subLabel: string;
  slots: SlotOption[];
}

function toIso(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// TODO: Replace with API call returning available drop-off slots and surcharges per day per zone.
const baseDropoffSlots: SlotOption[] = [
  { time: "Anytime during the day" },
  { time: "08:00 am - 10:00 am", surcharge: 15 },
  { time: "10:00 am - 12:00 pm" },
  { time: "12:00 pm - 02:00 pm" },
  { time: "02:00 pm - 04:00 pm" },
  { time: "04:00 pm - 06:00 pm" },
  { time: "06:00 pm - 08:00 pm", surcharge: 10 },
  { time: "08:00 pm - 10:00 pm", surcharge: 10 },
];

function buildMockDays(): DaySlots[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: DaySlots[] = [];
  // Drop-off typically starts 2 days out, but we still show a 7-day rail starting today
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    let label: string;
    if (i === 0) label = "Today";
    else if (i === 1) label = "Tomorrow";
    else label = d.toLocaleDateString("en-US", { weekday: "long" });
    const subLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    days.push({ date: toIso(d), label, subLabel, slots: baseDropoffSlots });
  }
  return days;
}

export function DropOffSheet({ open, onOpenChange }: DropOffSheetProps) {
  const storedDropoff = useOrderStore((s) => s.dropoff);
  const setDropoff = useOrderStore((s) => s.setDropoff);

  const days = useMemo(() => buildMockDays(), []);
  const defaultDate = days[2]?.date ?? days[0].date;

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedDate(storedDropoff?.date ?? defaultDate);
      if (storedDropoff?.slot) {
        const found = baseDropoffSlots.find((s) => s.time === storedDropoff.slot);
        setSelectedSlot(found ?? null);
      } else {
        setSelectedSlot(null);
      }
    }
  }, [open, storedDropoff, defaultDate]);

  const activeDay = days.find((d) => d.date === selectedDate) ?? days[0];

  const onDone = () => {
    if (!selectedSlot) return;
    setDropoff({
      date: selectedDate,
      slot: selectedSlot.time,
      surcharge: selectedSlot.surcharge ?? 0,
    });
    haptics.medium();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] rounded-t-[24px] border-0 bg-background pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-full max-h-[calc(90vh-1rem)] flex-col px-4 pt-2">
          <h2 className="mt-2 text-center text-lg font-semibold text-washmen-primary">
            Schedule Your Drop Off
          </h2>
          <div className="mt-4 grid min-h-[360px] flex-1 grid-cols-[120px_1fr] gap-3 overflow-hidden">
            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {days.map((d) => {
                const isSel = d.date === selectedDate;
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => {
                      haptics.light();
                      setSelectedDate(d.date);
                      setSelectedSlot(null);
                    }}
                    className={cn(
                      "press-effect rounded-xl border px-3 py-2.5 text-left",
                      isSel
                        ? "border-washmen-primary bg-washmen-light-green"
                        : "border-border/60 bg-background"
                    )}
                  >
                    <p className="text-sm font-medium leading-tight text-foreground">{d.label}</p>
                    <p className="mt-0.5 text-xs font-light text-muted-foreground">{d.subLabel}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {activeDay.slots.map((slot) => {
                const isSel = slot.time === selectedSlot?.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => {
                      haptics.light();
                      setSelectedSlot(slot);
                    }}
                    className={cn(
                      "press-effect flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left",
                      isSel
                        ? "border-washmen-primary bg-washmen-light-green"
                        : "border-border/60 bg-background"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-light text-muted-foreground">between</p>
                      <p className="text-sm font-medium text-foreground">{slot.time}</p>
                    </div>
                    {slot.surcharge ? (
                      <span className="rounded-[2px] bg-washmen-secondary-red px-[3px] py-px text-[10px] tracking-[0.3px] text-washmen-red">
                        +AED {slot.surcharge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 pb-4 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="press-effect flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background"
              aria-label="Close"
            >
              <ArrowLeft className="h-5 w-5 text-washmen-primary" />
            </button>
            <Button
              onClick={onDone}
              disabled={!selectedSlot}
              className="h-12 flex-1 text-sm font-semibold"
            >
              Done
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}