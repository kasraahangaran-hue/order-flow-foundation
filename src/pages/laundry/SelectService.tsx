import PlaceholderScreen from "./PlaceholderScreen";

export default function SelectService() {
  // No `step` prop -> progress underline is hidden on this screen.
  return (
    <PlaceholderScreen
      title="Laundry Order"
      backTo={-1}
      nextTo="/laundry/order-details"
      ctaLabel="Continue"
      showSamples
      showSupport
    />
  );
}