import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { Button } from "@/components/ui/button";

export default function AddressMapScreen() {
  const navigate = useNavigate();
  const pendingDraft = useOrderStore((s) => s.pendingAddressDraft);
  const setPendingAddressDraft = useOrderStore((s) => s.setPendingAddressDraft);

  const onBack = () => {
    haptics.light();
    setPendingAddressDraft(null);
    navigate("/laundry/order-details");
  };

  const onConfirm = () => {
    haptics.medium();
    const draft = pendingDraft ?? {
      lat: 25.2105,
      lng: 55.2796,
      formattedAddress: "Al Ferdous 4, DIFC, Dubai",
    };
    setPendingAddressDraft(draft);
    navigate("/laundry/order-details/address/type");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-washmen-primary" />
        </button>
        <h1 className="text-base font-semibold text-washmen-primary">Pick Location</h1>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <MapPin className="h-8 w-8 text-washmen-primary" />
        </div>
        <p className="text-base font-semibold text-washmen-primary">
          Map screen placeholder
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          The real Google Maps integration ships in the next build. For now, tap
          Confirm Pin to continue the flow.
        </p>
        {pendingDraft ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Editing: {pendingDraft.formattedAddress}
          </p>
        ) : null}
      </div>

      <div className="border-t border-border bg-card p-4">
        <Button className="w-full h-12 text-sm font-semibold" onClick={onConfirm}>
          Confirm Pin
        </Button>
      </div>
    </div>
  );
}