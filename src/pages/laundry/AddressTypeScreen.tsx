import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { Button } from "@/components/ui/button";
import { AddressTypeTile } from "@/components/order/AddressTypeTile";
import type { AddressType } from "@/stores/orderStore";

const TYPES: AddressType[] = ["office", "hotel", "villa", "apartment"];

export default function AddressTypeScreen() {
  const navigate = useNavigate();
  const pendingDraft = useOrderStore((s) => s.pendingAddressDraft);
  const setPendingAddressDraft = useOrderStore(
    (s) => s.setPendingAddressDraft,
  );

  const [selectedType, setSelectedType] = useState<AddressType | null>(
    pendingDraft?.type ?? null,
  );

  useEffect(() => {
    if (!pendingDraft) {
      navigate("/laundry/order-details/address/map", { replace: true });
    }
  }, [pendingDraft, navigate]);

  if (!pendingDraft) return null;

  const onSelect = (type: AddressType) => {
    haptics.light();
    setSelectedType(type);
  };

  const onBack = () => {
    haptics.light();
    navigate("/laundry/order-details/address/map");
  };

  const onContinue = () => {
    if (!selectedType) return;
    haptics.medium();
    const fields =
      pendingDraft.type === selectedType ? pendingDraft.fields : undefined;
    setPendingAddressDraft({
      ...pendingDraft,
      type: selectedType,
      fields,
    });
    navigate("/laundry/order-details/address/details");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center gap-2 px-6 py-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-washmen-primary" />
        </button>
      </div>

      <div className="flex-1 px-6 pb-4">
        <h1 className="mb-6 text-[20px] font-semibold text-washmen-primary">
          Select Address Type
        </h1>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map((type) => (
            <AddressTypeTile
              key={type}
              type={type}
              selected={selectedType === type}
              onSelect={() => onSelect(type)}
              variant="card"
            />
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-card px-6 pt-3 pb-4">
        <Button
          className="h-[42px] w-full text-sm font-semibold"
          onClick={onContinue}
          disabled={!selectedType}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
