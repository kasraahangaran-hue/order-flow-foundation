import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import delicatePhotoEducationUrl from "@/assets/icons/delicate-photo-education.svg";

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
 * Uses AlertDialog (not Dialog) so there's no top-right close button —
 * the only exit is the Got It CTA, ensuring the user actively
 * acknowledges the constraint.
 */
export function DelicatePhotoEducationDialog({
  open,
  onConfirm,
}: DelicatePhotoEducationDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-[320px] rounded-2xl p-6 flex flex-col items-center gap-4">
        {/* Multi-bag illustration showing service-specific bags with a
            red X badge over the unsupported types — communicates which
            bags this feature applies to before the camera launches. */}
        <img
          src={delicatePhotoEducationUrl}
          alt=""
          className="h-32 w-auto select-none"
          draggable={false}
        />

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
      </AlertDialogContent>
    </AlertDialog>
  );
}