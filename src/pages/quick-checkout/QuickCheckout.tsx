import { useNavigate } from "react-router-dom";
import { OrderLayout, OrderPrimaryButton } from "@/components/order/OrderLayout";
import { ServiceSelector } from "@/components/order/ServiceSelector";

export default function QuickCheckout() {
  const navigate = useNavigate();
  return (
    <OrderLayout
      title="Quick Checkout"
      onBack={() => navigate(-1)}
      footerSlot={<OrderPrimaryButton disabled>Place Order</OrderPrimaryButton>}
    >
      <ServiceSelector variant="screen" entryPoint="quick-checkout" />
    </OrderLayout>
  );
}