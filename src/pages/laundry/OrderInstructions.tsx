import PlaceholderScreen from "./PlaceholderScreen";

export default function OrderInstructions() {
  return (
    <PlaceholderScreen
      title="Order Instructions"
      step={2}
      backTo="/laundry/order-details"
      nextTo="/laundry/last-step"
    />
  );
}