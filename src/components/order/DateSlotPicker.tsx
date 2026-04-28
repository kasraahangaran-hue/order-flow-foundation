import { Lightbulb, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

export interface SlotOption {
  time: string;
  variant: "wide" | "between";
  surcharge?: number;
  freeDelivery?: boolean;
}

export interface DayOption {
  date: string;
  label: string;
  subLabel: string;
  badge?: "next-day-delivery";
  freeDelivery?: boolean;
  /** Day-level surcharge percentage shown as a red pill (e.g. 50 → "+50% surcharge"). */
  daySurchargePct?: number;
  slots: SlotOption[];
}

interface DateSlotPickerProps {
  days: DayOption[];
  selectedDate: string;
  selectedSlotTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: SlotOption | null) => void;
  showOnTimeTip?: boolean;
}

function FreeDeliveryTag({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={cn(
        "mt-1 inline-flex w-fit rounded-[2px] px-[3px] py-px",
        isSelected ? "bg-[#A4FF00]" : "bg-washmen-light-green"
      )}
    >
      <span className="text-[10px] font-medium leading-[14px] tracking-[0.3px] text-washmen-primary">
        Free delivery
      </span>
    </div>
  );
}

function DaySurchargeTag({ pct }: { pct: number }) {
  return (
    <div className="mt-1 inline-flex w-fit rounded-[2px] bg-washmen-secondary-red px-[3px] py-px">
      <span className="text-[10px] font-medium leading-[14px] tracking-[0.3px] text-washmen-red">
        +{pct}% surcharge
      </span>
    </div>
  );
}

function parseAnytimeSlot(time: string): { prefix: string; suffix: string } {
  if (time === "Anytime") {
    return { prefix: "", suffix: "Anytime" };
  }
  if (time.startsWith("Anytime ")) {
    return { prefix: "Anytime", suffix: time.slice("Anytime ".length) };
  }
  return { prefix: "", suffix: time };
}

function ServiceSurchargeTag({ amount }: { amount: number }) {
  return (
    <div className="mt-1 inline-flex items-start rounded-[2px] bg-washmen-secondary-red px-[3px] py-px">
      <span className="text-[10px] leading-[14px] tracking-[0.3px] text-washmen-red">
        AED {amount} service
      </span>
    </div>
  );
}

export function DateSlotPicker({
  days,
  selectedDate,
  selectedSlotTime,
  onSelectDate,
  onSelectSlot,
  showOnTimeTip = false,
}: DateSlotPickerProps) {
  const activeDay = days.find((d) => d.date === selectedDate) ?? days[0];

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col gap-4">
      {showOnTimeTip ? (
        <div className="flex flex-shrink-0 items-center gap-2 rounded-[8px] bg-washmen-light-green p-2">
          <Lightbulb className="h-4 w-4 shrink-0 text-washmen-primary" strokeWidth={2} />
          <p className="text-[14px] font-medium leading-[20px] text-washmen-primary">
            We're 98% on time with your deliveries!
          </p>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 gap-[9px] overflow-hidden">
        {/* Day rail — independent vertical scroll */}
        <div className="flex flex-1 flex-col gap-[9px] overflow-y-auto pr-1">
          {days.map((d) => {
            const isSel = d.date === selectedDate;
            const hasBadge = d.badge === "next-day-delivery";

            const handleSelect = () => {
              haptics.light();
              onSelectDate(d.date);
              // Toggle behavior — auto-pick earliest FREE slot of new day, never empty
              const earliestFree = d.slots.find((s) => !s.surcharge) ?? d.slots[0];
              if (earliestFree) {
                onSelectSlot(earliestFree);
              }
            };

            if (hasBadge) {
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={handleSelect}
                  className={cn(
                    "press-effect flex w-full flex-col overflow-hidden rounded-[6px] border text-left",
                    isSel ? "border-washmen-primary" : "border-[#F2F3F8]"
                  )}
                >
                  {/* Purple badge — no border, the outer wrapper carries it. Stays purple regardless of selection. */}
                  <div className="flex h-[19px] items-center justify-center gap-[2px] bg-[#9176FF] px-1">
                    <Clock className="h-[10px] w-[10px] text-white" strokeWidth={2.5} />
                    <span className="whitespace-nowrap text-[9px] font-bold italic leading-[7px] tracking-[0.4px] text-white">
                      NEXT-DAY DELIVERY
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex w-full flex-col gap-px px-3 py-2 text-washmen-primary",
                      isSel ? "bg-washmen-light-green" : "bg-white"
                    )}
                  >
                    <p className="text-[14px] font-normal leading-[20px] tracking-[0.1px]">
                      {d.label}
                    </p>
                    <p className="text-[12px] font-light leading-[18px] tracking-[0.1px]">
                      {d.subLabel}
                    </p>
                    {d.daySurchargePct ? (
                      <DaySurchargeTag pct={d.daySurchargePct} />
                    ) : d.freeDelivery ? (
                      <FreeDeliveryTag isSelected={isSel} />
                    ) : null}
                  </div>
                </button>
              );
            }

            return (
              <button
                key={d.date}
                type="button"
                onClick={handleSelect}
                className={cn(
                  "press-effect flex w-full flex-col gap-px rounded-[6px] border px-3 py-2 text-left text-washmen-primary",
                  isSel
                    ? "border-washmen-primary bg-washmen-light-green"
                    : "border-[#F2F3F8] bg-white"
                )}
              >
                <p className="text-[14px] font-normal leading-[20px] tracking-[0.1px]">
                  {d.label}
                </p>
                <p className="text-[12px] font-light leading-[18px] tracking-[0.1px]">
                  {d.subLabel}
                </p>
                {d.daySurchargePct ? (
                  <DaySurchargeTag pct={d.daySurchargePct} />
                ) : d.freeDelivery ? (
                  <FreeDeliveryTag isSelected={isSel} />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Slot list — independent vertical scroll */}
        <div className="flex flex-1 flex-col gap-[9px] overflow-y-auto pr-1">
          {activeDay.slots.map((slot) => {
            const isSel = slot.time === selectedSlotTime;

            const handleSelect = () => {
              haptics.light();
              onSelectSlot(slot);
            };

            if (slot.variant === "wide") {
              const { prefix, suffix } = parseAnytimeSlot(slot.time);
              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={handleSelect}
                  className={cn(
                    "press-effect flex w-full flex-col items-start gap-0.5 rounded-[6px] border px-3 py-2 text-left",
                    isSel
                      ? "border-washmen-primary bg-washmen-light-green"
                      : "border-[#F2F3F8] bg-white"
                  )}
                >
                  {prefix ? (
                    <p className="text-[12px] font-light leading-[18px] tracking-[0.1px] text-washmen-primary">
                      {prefix}
                    </p>
                  ) : null}
                  <p className="text-[14px] font-normal leading-[20px] tracking-[0.1px] text-washmen-primary">
                    {suffix}
                  </p>
                  {slot.freeDelivery ? <FreeDeliveryTag isSelected={isSel} /> : null}
                  {slot.surcharge ? <ServiceSurchargeTag amount={slot.surcharge} /> : null}
                </button>
              );
            }

            return (
              <button
                key={slot.time}
                type="button"
                onClick={handleSelect}
                className={cn(
                  "press-effect flex w-full flex-col items-start gap-0.5 rounded-[6px] border px-3 py-2 text-left",
                  isSel
                    ? "border-washmen-primary bg-washmen-light-green"
                    : "border-[#F2F3F8] bg-white"
                )}
              >
                <p className="text-[12px] font-light leading-[18px] tracking-[0.1px] text-washmen-primary">
                  between
                </p>
                <p className="text-[14px] font-normal leading-[20px] tracking-[0.1px] text-washmen-primary">
                  {slot.time}
                </p>
                {slot.surcharge ? (
                  <ServiceSurchargeTag amount={slot.surcharge} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}