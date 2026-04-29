import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheetShell } from "@/components/order/BottomSheetShell";
import { RadioRow } from "@/components/order/RadioRow";
import { ToggleRow } from "@/components/order/ToggleRow";
import { ChipPill } from "@/components/order/ChipPill";
import { ClearAllButton } from "@/components/order/ClearAllButton";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
      {children}
    </p>
  );
}

const RADIO_OPTIONS = [
  "No Preference",
  "Ring the doorbell",
  "Knock the door",
  "Do not disturb, bags outside",
];

const CHIP_OPTIONS = ["All", "T shirt", "Shirt", "Blouse", "Jeans"];

export default function ComponentsPreview() {
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);
  const [openC, setOpenC] = useState(false);

  const [radioIdx, setRadioIdx] = useState(0);
  const [creaseIndentSelected, setCreaseIndentSelected] = useState(false);

  const [t1, setT1] = useState(false);
  const [t2, setT2] = useState(true);
  const [t3, setT3] = useState(false);

  const [chipSel, setChipSel] = useState<Record<string, boolean>>({
    Shirt: true,
    Blouse: true,
  });

  const placeholder = (
    <p className="text-[14px] font-light leading-[20px] text-washmen-primary">
      This is placeholder body content for the bottom sheet shell preview. It
      should scroll independently of the title and footer when long enough.
    </p>
  );

  return (
    <div className="min-h-screen bg-background p-6 max-w-md mx-auto space-y-8">
      {/* A */}
      <section>
        <SectionLabel>BottomSheetShell — apply-only</SectionLabel>
        <Button onClick={() => setOpenA(true)}>Open</Button>
        <BottomSheetShell
          open={openA}
          onOpenChange={setOpenA}
          title="Test Sheet"
          footer="apply-only"
          onPrimary={() => setOpenA(false)}
        >
          {placeholder}
        </BottomSheetShell>
      </section>

      {/* B */}
      <section>
        <SectionLabel>BottomSheetShell — back-and-apply</SectionLabel>
        <Button onClick={() => setOpenB(true)}>Open</Button>
        <BottomSheetShell
          open={openB}
          onOpenChange={setOpenB}
          title="Test Sheet"
          footer="back-and-apply"
          onBack={() => setOpenB(false)}
          onPrimary={() => setOpenB(false)}
        >
          {placeholder}
        </BottomSheetShell>
      </section>

      {/* C */}
      <section>
        <SectionLabel>BottomSheetShell — dual-apply</SectionLabel>
        <Button onClick={() => setOpenC(true)}>Open</Button>
        <BottomSheetShell
          open={openC}
          onOpenChange={setOpenC}
          title="Test Sheet"
          footer="dual-apply"
          onPrimary={() => setOpenC(false)}
          onSecondary={() => setOpenC(false)}
        >
          {placeholder}
        </BottomSheetShell>
      </section>

      {/* D */}
      <section>
        <SectionLabel>RadioRow</SectionLabel>
        <div className="bg-white rounded-card p-2">
          {RADIO_OPTIONS.map((label, i) => (
            <RadioRow
              key={label}
              label={label}
              selected={radioIdx === i}
              onSelect={() => setRadioIdx(i)}
            />
          ))}
          <RadioRow
            label="Full Crease"
            selected={creaseIndentSelected}
            onSelect={() => setCreaseIndentSelected((v) => !v)}
            indented
          />
        </div>
      </section>

      {/* E */}
      <section>
        <SectionLabel>ToggleRow</SectionLabel>
        <div className="bg-white rounded-card p-3">
          <ToggleRow
            label="Shirts Sleeve Creases"
            checked={t1}
            onCheckedChange={setT1}
            labelMedium
          />
          <ToggleRow
            label="Pants Front Creases"
            checked={t2}
            onCheckedChange={setT2}
            labelMedium
          />
          <ToggleRow
            label="Call on arrival"
            checked={t3}
            onCheckedChange={setT3}
            icon={<Phone className="w-6 h-6 text-washmen-primary" />}
          />
        </div>
      </section>

      {/* F */}
      <section>
        <SectionLabel>ChipPill</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {CHIP_OPTIONS.map((label) => (
            <ChipPill
              key={label}
              label={label}
              selected={!!chipSel[label]}
              onToggle={() =>
                setChipSel((s) => ({ ...s, [label]: !s[label] }))
              }
            />
          ))}
        </div>
      </section>

      {/* G */}
      <section>
        <SectionLabel>ClearAllButton</SectionLabel>
        <div className="flex gap-3">
          <ClearAllButton active={false} onClear={() => {}} />
          <ClearAllButton
            active={true}
            onClear={() => console.log("cleared")}
          />
        </div>
      </section>
    </div>
  );
}