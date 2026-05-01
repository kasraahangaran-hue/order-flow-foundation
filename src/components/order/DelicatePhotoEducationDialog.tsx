import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";

interface DelicatePhotoEducationDialogProps {
  open: boolean;
  onConfirm: () => void;
}

/**
 * One-time-per-order education modal shown the first time the user taps
 * "Take a photo" in the Order Instructions Send-a-Photo section. Explains
 * that delicate-photo features only apply to Clean & Press / Bed & Bath
 * items so users understand the constraint before investing time in
 * photographing each item.
 *
 * The illustration is a placeholder — to be swapped for the real Figma
 * artwork once exported.
 */
export function DelicatePhotoEducationDialog({
  open,
  onConfirm,
}: DelicatePhotoEducationDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onConfirm();
      }}
    >
      <DialogContent className="max-w-[320px] rounded-2xl p-6 flex flex-col items-center gap-4">
        {/* Placeholder illustration — replace with real Figma export */}
        <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-washmen-pale-grey">
          <span className="text-[10px] text-washmen-slate-grey text-center px-2">
            Illustration placeholder
          </span>
        </div>

        <p className="text-center text-[14px] leading-[20px] text-washmen-primary">
          This feature is only available for items put in the{" "}
          <span className="font-semibold">Clean &amp; Press</span> or{" "}
          <span className="font-semibold">Bed &amp; Bath</span> bags
        </p>

        <Button
          className="w-full h-[42px] rounded-[8px] text-sm font-semibold"
          onClick={() => {
            haptics.medium();
            onConfirm();
          }}
        >
          Got It
        </Button>
      </DialogContent>
    </Dialog>
  );
}