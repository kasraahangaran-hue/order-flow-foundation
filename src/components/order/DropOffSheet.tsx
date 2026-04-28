import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { DateSlotPicker, type DayOption, type SlotOption } from "./DateSlotPicker";

interface DropOffSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// TODO: Replace with API call returning available drop-off slots per day per zone.
// Surcharge values are placeholders — real prices come from backend.
const DROPOFF_SLOTS: SlotOption[] = [
  { time: "Anytime during the day", variant: "wide", freeDelivery: true },
  { time: "Anytime before 08:00 pm", variant: "wide", freeDelivery: true },
  { time: "Anytime after 08:00 pm", variant: "wide", freeDelivery: true },
  { time: "06:00 pm - 08:00 pm", variant: "between", surcharge: 5 },
  { time: "08:00 pm - 10:00 pm", variant: "between", surcharge: 5 },
];

function buildDropoffMockDays(): DayOption[] {
  const days: DayOption[] = [];
  // Day 0 (today) is not a drop-off option for laundry — start at +1
  for (let i = 1; i <= 6; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    let label: string;
    if (i === 1) label = "Tomorrow";
    else label = `+${i} days`;
    const subLabel = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const isFirst = i === 1;
    days.push({
      date: iso,
      label,
      subLabel,
      badge: isFirst ? "next-day-delivery" : undefined,
      freeDelivery: !isFirst,
      slots: DROPOFF_SLOTS,
    });
  }
  return days;
}

export function DropOffSheet({ open, onOpenChange }: DropOffSheetProps) {
  const storedDropoff = useOrderStore((s) => s.dropoff);
  const setDropoff = useOrderStore((s) => s.setDropoff);

  const days = useMemo(() => buildDropoffMockDays(), []);

  const [selectedDate, setSelectedDate] = useState<string>(days[0].date);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);

  useEffect(() => {
    if (open) {
      const seedDate = storedDropoff?.date ?? days[0].date;
      setSelectedDate(seedDate);
      const day = days.find((d) => d.date === seedDate) ?? days[0];
      const found = storedDropoff?.slot
        ? day.slots.find((s) => s.time === storedDropoff.slot) ?? null
        : null;
      setSelectedSlot(found);
    }
  }, [open, storedDropoff, days]);

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
        <DrawerHeader className="px-4 pb-2 pt-2 text-center">
          <DrawerTitle className="text-[20px] font-bold leading-[24px] tracking-[0.4px] text-washmen-primary">
            Select Your Drop Off Time
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex max-h-[70vh] flex-col overflow-y-auto px-4 pb-2">
          <DateSlotPicker
            days={days}
            selectedDate={selectedDate}
            selectedSlotTime={selectedSlot?.time ?? null}
            onSelectDate={setSelectedDate}
            onSelectSlot={setSelectedSlot}
            showOnTimeTip
          />
        </div>

        <div className="flex items-center gap-3 px-4 pb-4 pt-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="press-effect flex h-[42px] w-12 items-center justify-center rounded-md border border-border bg-background"
            aria-label="Close"
          >
            <ArrowLeft className="h-5 w-5 text-washmen-primary" />
          </button>
          <Button
            onClick={onDone}
            disabled={!selectedSlot}
            className="h-[42px] flex-1 text-sm font-semibold"
          >
            Done
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}