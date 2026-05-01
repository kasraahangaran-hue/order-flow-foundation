import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { DateSlotPicker, type SlotOption } from "./DateSlotPicker";
import { buildDropoffMockDays } from "@/data/slots";
import dropoffDoorImg from "@/assets/images/dropoff-at-door.jpg";
// TODO: Replace with proper drop-off-in-person illustration when designed.
import dropoffPersonImg from "@/assets/images/dropoff-in-person.jpg";

interface DropOffSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DropoffMode = "door" | "in_person";

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
      const earliestFree = day.slots.find((s) => s.freeDelivery) ?? day.slots[0];
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

  const step2Title = dropoffMode === "in_person" ? "Delivery in Person" : "Delivery at Door";
  const title = step === 1 ? "Schedule Your Drop Off" : step2Title;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex max-h-[90vh] flex-col rounded-t-[24px] border-0 bg-background pb-[max(env(safe-area-inset-bottom),1rem)]">
        <DrawerHeader className="mb-2 flex-shrink-0 px-4 pb-2 pt-2 text-left">
          <DrawerTitle className="text-left text-[20px] font-bold leading-[24px] tracking-[0.4px] text-washmen-primary">
            {title}
          </DrawerTitle>
        </DrawerHeader>

        {step === 1 ? (
          <div key="step-1" className="flex-shrink-0 animate-in fade-in-0 duration-200 px-4 pb-2">
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
          <div key="step-2" className="flex flex-1 min-h-0 flex-col animate-in fade-in-0 duration-200 px-4 pb-2">
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

        <div className="flex flex-shrink-0 items-center gap-3 px-4 pb-4 pt-3">
          <button
            type="button"
            onClick={() => {
              haptics.light();
              if (step === 2) setStep(1);
              else onOpenChange(false);
            }}
            className="press-effect flex h-[42px] w-12 items-center justify-center rounded-[8px] border border-border bg-background"
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
              className="h-[42px] flex-1 rounded-[8px] text-sm font-semibold"
            >
              Confirm
            </Button>
          ) : (
            <Button
              onClick={onDone}
              disabled={!selectedSlot}
              className="h-[42px] flex-1 rounded-[8px] text-sm font-semibold"
            >
              Done
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}