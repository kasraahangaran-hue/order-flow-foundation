import PlaceholderScreen from "./PlaceholderScreen";

export default function LastStep() {
  return (
    <PlaceholderScreen
      title="Last Step"
      step={3}
      backTo="/laundry/order-instructions"
      ctaLabel="Place order"
    />
  );
}