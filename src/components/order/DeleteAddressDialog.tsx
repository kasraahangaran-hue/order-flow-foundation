import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DeleteAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteAddressDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteAddressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[320px] rounded-[12px] p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-[16px] font-semibold leading-[22px] text-washmen-primary">
            Delete Address
          </h2>
          <p className="text-[13px] font-light leading-[18px] text-washmen-slate-grey">
            Are you sure you want to delete this address?
          </p>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="press-effect mt-2 h-[42px] w-full rounded-[6px] bg-washmen-primary text-[14px] font-medium leading-[20px] text-white"
          >
            Yes, delete address
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="press-effect text-[14px] font-medium leading-[20px] text-washmen-slate-grey"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}