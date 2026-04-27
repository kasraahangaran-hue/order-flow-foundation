import { useNavigate } from "react-router-dom";
import { OrderLayout, OrderPrimaryButton } from "@/components/order/OrderLayout";
import { ServiceSelector } from "@/components/order/ServiceSelector";
import { useOrderStore } from "@/stores/orderStore";

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
      title="Laundry Order"
      onBack={() => navigate(-1)}
      footerSlot={
        <OrderPrimaryButton onClick={() => navigate("/laundry/order-details")}>
          {hasSelection ? "Continue to Order" : "Skip"}
        </OrderPrimaryButton>
      }
    >
      <ServiceSelector
        variant="screen"
        onLearnMoreWashAndFold={() => navigate("/laundry/wash-and-fold-info")}
      />
    </OrderLayout>
  );
}