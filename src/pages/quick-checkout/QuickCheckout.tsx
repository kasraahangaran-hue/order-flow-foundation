import { useNavigate } from "react-router-dom";
import { OrderLayout } from "@/components/order/OrderLayout";
import { ServiceSelector } from "@/components/order/ServiceSelector";
import { Button } from "@/components/ui/button";

export default function QuickCheckout() {
  const navigate = useNavigate();
  return (
    <OrderLayout
      title="Quick Checkout"
      // Flow root — no in-flow predecessor, so fall back to browser history.
      onBack={() => navigate(-1)}
      footerSlot={
        <Button disabled className="flex-1 h-12 text-sm font-semibold">
          Place Order
        </Button>
      }
    >
      <ServiceSelector variant="screen" entryPoint="quick-checkout" />
    </OrderLayout>
  );
}