import PlaceholderScreen from "./PlaceholderScreen";

export default function OrderDetails() {
  return (
    <PlaceholderScreen
      title="Order Details"
      step={1}
      backTo="/laundry/select-service"
      nextTo="/laundry/order-instructions"
    />
  );
}