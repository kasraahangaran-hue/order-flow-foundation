import { useNavigate } from "react-router-dom";
import { OrderLayout } from "@/components/order/OrderLayout";
import { ServiceSelector } from "@/components/order/ServiceSelector";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";

export default function SelectService() {
  const navigate = useNavigate();
  const services = useOrderStore((s) => s.services);

  const hasSelection =
    services.washAndFold ||
    services.addPressing ||
    services.cleanAndPress ||
    services.bedAndBath ||
    services.pressOnly;

  return (
    <OrderLayout
      title="Select Service(s)"
      step={1}
      // Flow root — no in-flow predecessor, so fall back to browser history.
      onBack={() => navigate(-1)}
      footerSlot={
        <Button
          className="flex-1 h-[42px] rounded-[8px] text-sm font-semibold"
          onClick={() => {
            haptics.medium();
            navigate("/laundry/order-details");
          }}
        >
          {hasSelection ? "Continue to Order" : "Skip"}
        </Button>
      }
    >
      <ServiceSelector
        variant="screen"
        entryPoint="laundry"
        onLearnMoreWashAndFold={() => navigate("/laundry/wash-and-fold-info")}
      />
    </OrderLayout>
  );
}