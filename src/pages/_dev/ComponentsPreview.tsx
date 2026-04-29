import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BottomSheetShell,
  type BottomSheetFooterVariant,
} from "@/components/order/BottomSheetShell";
import { RadioRow } from "@/components/order/RadioRow";
import { ToggleRow } from "@/components/order/ToggleRow";
import { ChipPill } from "@/components/order/ChipPill";
import { ClearAllButton } from "@/components/order/ClearAllButton";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

const PLACEHOLDER =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque feugiat, lorem in efficitur volutpat, neque urna porta urna, ac fermentum risus magna in nisl.";

export default function ComponentsPreview() {
  // BottomSheetShell — track which footer-variant sheet is open
  const [openShell, setOpenShell] = useState<BottomSheetFooterVariant | null>(null);

  // RadioRow — two independent groups
  const [pickup, setPickup] = useState<"none" | "ring" | "knock">("none");
  const [crease, setCrease] = useState<"full" | "partial">("full");

  // ToggleRow
  const [shirtSleeves, setShirtSleeves] = useState(true);
  const [pantsFront, setPantsFront] = useState(false);
  const [callOnArrival, setCallOnArrival] = useState(false);

  // ChipPill
  const [chips, setChips] = useState<Record<string, boolean>>({
    All: false,
    "T shirt": false,
    Shirt: true,
    Blouse: true,
    Jeans: false,
  });
  const toggleChip = (k: string) =>
    setChips((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="min-h-screen bg-background p-6 max-w-md mx-auto space-y-8">
      <header>
        <h1 className="text-xl font-bold text-washmen-primary">Components Preview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dev-only sandbox for the new instruction primitives.
        </p>
      </header>

      {/* BottomSheetShell */}
      <section>
        <SectionLabel>BottomSheetShell variants</SectionLabel>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => setOpenShell("single")}>
            Open shell — single footer
          </Button>
          <Button variant="outline" onClick={() => setOpenShell("split")}>
            Open shell — split footer
          </Button>
          <Button variant="outline" onClick={() => setOpenShell("none")}>
            Open shell — no footer
          </Button>
        </div>

        <BottomSheetShell
          open={openShell === "single"}
          onOpenChange={(o) => !o && setOpenShell(null)}
          title="Single footer"
          footerVariant="single"
          primaryLabel="Done"
          onPrimary={() => setOpenShell(null)}
        >
          <p className="text-sm text-washmen-secondary-700">{PLACEHOLDER}</p>
        </BottomSheetShell>

        <BottomSheetShell
          open={openShell === "split"}
          onOpenChange={(o) => !o && setOpenShell(null)}
          title="Split footer"
          footerVariant="split"
          primaryLabel="Apply"
          secondaryLabel="Clear"
          onPrimary={() => setOpenShell(null)}
          onSecondary={() => setOpenShell(null)}
        >
          <p className="text-sm text-washmen-secondary-700">{PLACEHOLDER}</p>
        </BottomSheetShell>

        <BottomSheetShell
          open={openShell === "none"}
          onOpenChange={(o) => !o && setOpenShell(null)}
          title="No footer"
          footerVariant="none"
        >
          <p className="text-sm text-washmen-secondary-700">{PLACEHOLDER}</p>
        </BottomSheetShell>
      </section>

      {/* RadioRow */}
      <section>
        <SectionLabel>RadioRow</SectionLabel>
        <div className="rounded-card bg-card p-2">
          <RadioRow
            label="No Preference"
            selected={pickup === "none"}
            onSelect={() => setPickup("none")}
          />
          <RadioRow
            label="Ring the doorbell"
            selected={pickup === "ring"}
            onSelect={() => setPickup("ring")}
          />
          <RadioRow
            label="Knock the door"
            selected={pickup === "knock"}
            onSelect={() => setPickup("knock")}
          />
          <RadioRow
            label="Full Crease"
            selected={crease === "full"}
            onSelect={() => setCrease("full")}
            indented
          />
        </div>
      </section>

      {/* ToggleRow */}
      <section>
        <SectionLabel>ToggleRow</SectionLabel>
        <div className="rounded-card bg-card p-2">
          <ToggleRow
            label="Shirts Sleeve Creases"
            checked={shirtSleeves}
            onCheckedChange={setShirtSleeves}
            labelMedium
          />
          <ToggleRow
            label="Pants Front Creases"
            checked={pantsFront}
            onCheckedChange={setPantsFront}
            labelMedium
          />
          <ToggleRow
            label="Call on arrival"
            checked={callOnArrival}
            onCheckedChange={setCallOnArrival}
            icon={Phone}
            labelMedium={false}
          />
        </div>
      </section>

      {/* ChipPill */}
      <section>
        <SectionLabel>ChipPill</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {Object.keys(chips).map((label) => (
            <ChipPill
              key={label}
              label={label}
              selected={chips[label]}
              onToggle={() => toggleChip(label)}
            />
          ))}
        </div>
      </section>

      {/* ClearAllButton */}
      <section>
        <SectionLabel>ClearAllButton</SectionLabel>
        <div className="flex items-center gap-3">
          <ClearAllButton active={false} onClear={() => {}} />
          <ClearAllButton
            active
            onClear={() => console.log("clear all")}
          />
        </div>
      </section>
    </div>
  );
}