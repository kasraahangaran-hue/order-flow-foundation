import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const reset = useOrderStore((s) => s.reset);

  useEffect(() => {
    haptics.success();
  }, []);

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-6 bg-subtle-bg px-6 text-center">
      <h1 className="text-2xl font-bold text-washmen-primary">Order placed!</h1>
      <p className="text-sm text-muted-foreground">
        Your order has been received. We'll be in touch shortly.
      </p>
      <Button
        className="h-[42px] px-6 text-sm font-semibold"
        onClick={() => {
          haptics.light();
          reset();
          navigate("/");
        }}
      >
        Back to Home
      </Button>
    </div>
  );
}
