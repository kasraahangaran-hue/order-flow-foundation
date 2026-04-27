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
      onBack={() => navigate(-1)}
      footerSlot={
        <Button
          className="flex-1 h-12 text-sm font-semibold"
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
        userType="new"
        onLearnMoreWashAndFold={() => navigate("/laundry/wash-and-fold-info")}
      />
    </OrderLayout>
  );
}