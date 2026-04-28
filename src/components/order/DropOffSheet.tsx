import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { DateSlotPicker, type DayOption, type SlotOption } from "./DateSlotPicker";
import dropoffDoorImg from "@/assets/dropoff-at-door.jpg";
// TODO: Replace with proper drop-off-in-person illustration when designed.
import dropoffPersonImg from "@/assets/dropoff-in-person.jpg";

interface DropOffSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DropoffMode = "door" | "in_person";

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

interface TypeTileProps {
  selected: boolean;
  image: string;
  label: string;
  onSelect: () => void;
}

function TypeTile({ selected, image, label, onSelect }: TypeTileProps) {
  return (
    <button
      type="button"
      onClick={() => {
        haptics.light();
        onSelect();
      }}
      className={cn(
        "press-effect flex flex-col overflow-hidden rounded-2xl text-left transition-all",
        selected ? "border-2 border-primary" : "border-2 border-transparent"
      )}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-secondary/40">
        <img
          src={image}
          alt={label}
          loading="lazy"
          width={512}
          height={384}
          className={cn(
            "h-full w-full object-cover transition-all",
            selected ? "" : "opacity-70 grayscale"
          )}
        />
      </div>
      <div
        className={cn(
          "whitespace-pre-line px-3 py-3 text-center text-sm font-medium leading-tight transition-colors",
          selected ? "bg-washmen-light-green text-washmen-primary" : "bg-secondary/40 text-foreground"
        )}
      >
        {label}
      </div>
    </button>
  );
}

export function DropOffSheet({ open, onOpenChange }: DropOffSheetProps) {
  const storedDropoff = useOrderStore((s) => s.dropoff);
  const setDropoff = useOrderStore((s) => s.setDropoff);

  const days = useMemo(() => buildDropoffMockDays(), []);

  const [step, setStep] = useState<1 | 2>(1);
  const [dropoffMode, setDropoffMode] = useState<DropoffMode>("door");
  const [selectedDate, setSelectedDate] = useState<string>(days[0].date);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setDropoffMode(storedDropoff?.mode ?? "door");
      const seedDate = storedDropoff?.date ?? days[0].date;
      setSelectedDate(seedDate);
      const day = days.find((d) => d.date === seedDate) ?? days[0];
      const stored = storedDropoff?.slot
        ? day.slots.find((s) => s.time === storedDropoff.slot)
        : null;
      // Fallback to earliest FREE slot, not just first slot
      const earliestFree = day.slots.find((s) => !s.surcharge) ?? day.slots[0];
      setSelectedSlot(stored ?? earliestFree ?? null);
    }
  }, [open, storedDropoff, days]);

  const onDone = () => {
    if (!selectedSlot) return;
    setDropoff({
      mode: dropoffMode,
      date: selectedDate,
      slot: selectedSlot.time,
      surcharge: selectedSlot.surcharge ?? 0,
    });
    haptics.medium();
    onOpenChange(false);
  };

  const step2Title = dropoffMode === "in_person" ? "Drop Off in Person" : "Drop Off at Door";
  const title = step === 1 ? "Schedule Your Drop Off" : step2Title;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] rounded-t-[24px] border-0 bg-background pb-[env(safe-area-inset-bottom)]">
        <DrawerHeader className="mb-2 flex-shrink-0 px-4 pb-2 pt-2 text-left">
          <DrawerTitle className="text-left text-[20px] font-bold leading-[24px] tracking-[0.4px] text-washmen-primary">
            {title}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex max-h-[70vh] flex-col overflow-y-auto px-4 pb-2">
          {step === 1 ? (
            <div key="step-1" className="animate-in fade-in-0 duration-200">
              <div className="grid grid-cols-2 gap-3">
                <TypeTile
                  selected={dropoffMode === "door"}
                  image={dropoffDoorImg}
                  label={"Drop Off\nat Door"}
                  onSelect={() => setDropoffMode("door")}
                />
                <TypeTile
                  selected={dropoffMode === "in_person"}
                  image={dropoffPersonImg}
                  label={"Receive from\ndriver in person"}
                  onSelect={() => setDropoffMode("in_person")}
                />
              </div>
              <p className="mt-5 px-2 text-center text-sm leading-relaxed text-foreground/80">
                {dropoffMode === "door"
                  ? "We will leave your bags at your door once they are ready"
                  : "Receive your bags directly from the Washmen driver in person"}
              </p>
            </div>
          ) : (
            <div key="step-2" className="animate-in fade-in-0 duration-200">
              <DateSlotPicker
                days={days}
                selectedDate={selectedDate}
                selectedSlotTime={selectedSlot?.time ?? null}
                onSelectDate={setSelectedDate}
                onSelectSlot={setSelectedSlot}
                showOnTimeTip
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-4 pb-4 pt-3">
          <button
            type="button"
            onClick={() => {
              if (step === 2) setStep(1);
              else onOpenChange(false);
            }}
            className="press-effect flex h-[42px] w-12 items-center justify-center rounded-md border border-border bg-background"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-washmen-primary" />
          </button>
          {step === 1 ? (
            <Button
              onClick={() => {
                haptics.light();
                setStep(2);
              }}
              className="h-[42px] flex-1 text-sm font-semibold"
            >
              Confirm
            </Button>
          ) : (
            <Button
              onClick={onDone}
              disabled={!selectedSlot}
              className="h-[42px] flex-1 text-sm font-semibold"
            >
              Done
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}