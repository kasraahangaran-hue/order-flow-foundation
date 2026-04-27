import { useNavigate } from "react-router-dom";
import { OrderLayout, OrderPrimaryButton } from "@/components/order/OrderLayout";

export default function QuickCheckout() {
  const navigate = useNavigate();
  return (
    <OrderLayout
      title="Quick Checkout"
      onBack={() => navigate(-1)}
      footerSlot={<OrderPrimaryButton disabled>Place Order</OrderPrimaryButton>}
    >
      <div className="rounded-card bg-subtle-bg p-4 text-sm text-washmen-secondary-600">
        Screen content goes here.
      </div>
    </OrderLayout>
  );
}