import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { BottomSheetShell } from "./BottomSheetShell";
import { DeleteAddressDialog } from "./DeleteAddressDialog";
import { addressCardLines } from "@/lib/addressFormatting";
import { cn } from "@/lib/utils";
import type { Address } from "@/stores/orderStore";

interface SelectAddressSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SelectAddressSheet({
  open,
  onOpenChange,
}: SelectAddressSheetProps) {
  const navigate = useNavigate();
  const addresses = useOrderStore((s) => s.addresses);
  const selectedAddressId = useOrderStore((s) => s.selectedAddressId);
  const selectAddress = useOrderStore((s) => s.selectAddress);
  const setPendingAddressDraft = useOrderStore((s) => s.setPendingAddressDraft);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const onAddNew = () => {
    haptics.light();
    setPendingAddressDraft(null);
    onOpenChange(false);
    navigate("/laundry/order-details/address/map");
  };

  const onSelect = (id: string) => {
    haptics.light();
    selectAddress(id);
    onOpenChange(false);
  };

  const onEdit = (address: Address) => {
    haptics.light();
    setPendingAddressDraft({
      id: address.id,
      lat: address.lat,
      lng: address.lng,
      formattedAddress: address.formattedAddress,
      type: address.type,
      fields: address.fields,
    });
    onOpenChange(false);
    navigate("/laundry/order-details/address/map");
  };

  return (
    <>
      <BottomSheetShell
        open={open}
        onOpenChange={onOpenChange}
        title="Select Address"
        footer="none"
      >
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onAddNew}
            className="press-effect flex items-center gap-2 py-2 text-left text-[14px] font-medium text-washmen-primary"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add New Address
          </button>

          <div className="flex flex-col gap-2">
            {addresses.map((address) => (
              <AddressRow
                key={address.id}
                address={address}
                selected={address.id === selectedAddressId}
                onSelect={() => onSelect(address.id)}
                onEdit={() => onEdit(address)}
                onDelete={() => setPendingDeleteId(address.id)}
              />
            ))}
          </div>
        </div>
      </BottomSheetShell>

      <DeleteAddressDialog
        open={!!pendingDeleteId}
        onOpenChange={(o) => {
          if (!o) setPendingDeleteId(null);
        }}
        onConfirm={() => {
          if (pendingDeleteId) {
            useOrderStore.getState().deleteAddress(pendingDeleteId);
            setPendingDeleteId(null);
          }
        }}
      />
    </>
  );
}

interface AddressRowProps {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function AddressRow({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: AddressRowProps) {
  const lines = addressCardLines(address);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "press-effect relative cursor-pointer rounded-[8px] border bg-white p-4",
        selected
          ? "border-washmen-primary bg-washmen-light-green"
          : "border-washmen-pale-grey",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] font-light leading-[14px] tracking-[0.3px] text-washmen-secondary-400">
            {lines.primaryLabel}
          </p>
          <p className="text-[14px] font-semibold leading-[20px] tracking-[0.1px] text-washmen-primary">
            {lines.primaryValue}
          </p>
          <p className="pt-1 text-[11px] font-light leading-[14px] tracking-[0.3px] text-washmen-secondary-400">
            {lines.secondaryLabel}
          </p>
          <p className="text-[14px] font-normal leading-[20px] tracking-[0.1px] text-washmen-slate-grey">
            {lines.secondaryValue}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!selected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Delete address"
              className="press-effect flex h-8 w-8 items-center justify-center rounded-full"
            >
              <Trash2 className="h-4 w-4 text-washmen-primary" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Edit address"
            className="press-effect flex h-8 w-8 items-center justify-center rounded-full"
          >
            <Pencil className="h-4 w-4 text-washmen-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}