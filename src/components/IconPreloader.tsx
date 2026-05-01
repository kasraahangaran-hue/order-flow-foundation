/**
 * Renders hidden <img> tags for every icon SVG used in the app, mounted
 * once at App level. The browser fetches and decodes them in parallel
 * at app start, so when the user later navigates to a screen or opens
 * a sheet, the icons are already cached — <img src> paints instantly.
 *
 * Add new icon imports to this file whenever a new icon is integrated.
 * The pattern keeps icons feeling as instant as Lucide inline icons.
 */

// Service tile icons
import washFoldIconUrl from "@/assets/icons/service-wash-fold.svg";
import cleanPressIconUrl from "@/assets/icons/service-clean-press.svg";
import bedBathIconUrl from "@/assets/icons/service-bed-bath.svg";
import pressOnlyIconUrl from "@/assets/icons/service-press-only.svg";

// Add Pressing toggle states
import addPressingActiveUrl from "@/assets/icons/add-pressing-active.svg";
import addPressingInactiveUrl from "@/assets/icons/add-pressing-inactive.svg";

// Bag icons (cart row indicators in LastStep, AutoApprovalsSheet illustrations)
import bagWashFoldUrl from "@/assets/icons/bag-wash-fold.svg";
import bagCleanPressUrl from "@/assets/icons/bag-clean-press.svg";
import bagBedBathUrl from "@/assets/icons/bag-bed-bath.svg";
import bagPressOnlyUrl from "@/assets/icons/bag-press-only.svg";
import bagShoeBagUrl from "@/assets/icons/bag-shoe-bag.svg";
import bagWashFoldPlusUrl from "@/assets/icons/bag-wash-fold-plus.svg";

// Order Details / Driver Instructions Sheet
import orderAddressUrl from "@/assets/icons/order-address.svg";
import orderPickupUrl from "@/assets/icons/order-pickup.svg";
import orderDropoffUrl from "@/assets/icons/order-dropoff.svg";
import orderDriverInstructionsUrl from "@/assets/icons/order-driver-instructions.svg";
import orderClockUrl from "@/assets/icons/order-clock.svg";

// Order Instructions section icons + sheet headers
import instructionSendPhotoUrl from "@/assets/icons/instruction-send-photo.svg";
import instructionFoldingUrl from "@/assets/icons/instruction-folding.svg";
import instructionCreasesUrl from "@/assets/icons/instruction-creases.svg";
import instructionStarchUrl from "@/assets/icons/instruction-starch.svg";
import instructionApproveUrl from "@/assets/icons/instruction-approve.svg";

// Map pin
import locationPinUrl from "@/assets/icons/location-pin.svg";

// Address type illustrations
import addressOfficeUrl from "@/assets/icons/address-office.svg";
import addressHotelUrl from "@/assets/icons/address-hotel.svg";
import addressVillaUrl from "@/assets/icons/address-villa.svg";
import addressApartmentUrl from "@/assets/icons/address-apartment.svg";

// Payment / Last Step / How It Works
import applePayWordmarkUrl from "@/assets/icons/apple-pay-wordmark.svg";
import viewPricingUrl from "@/assets/icons/view-pricing.svg";
import contactServiceUrl from "@/assets/icons/contact-customer-service.svg";
import paymentSummaryUrl from "@/assets/icons/payment-summary.svg";
import paymentMethodUrl from "@/assets/icons/payment-method.svg";
import promocodeUrl from "@/assets/icons/promocode.svg";
import creditUrl from "@/assets/icons/credit.svg";

const ALL_ICON_URLS = [
  washFoldIconUrl,
  cleanPressIconUrl,
  bedBathIconUrl,
  pressOnlyIconUrl,
  addPressingActiveUrl,
  addPressingInactiveUrl,
  bagWashFoldUrl,
  bagCleanPressUrl,
  bagBedBathUrl,
  bagPressOnlyUrl,
  bagShoeBagUrl,
  bagWashFoldPlusUrl,
  orderAddressUrl,
  orderPickupUrl,
  orderDropoffUrl,
  orderDriverInstructionsUrl,
  orderClockUrl,
  instructionSendPhotoUrl,
  instructionFoldingUrl,
  instructionCreasesUrl,
  instructionStarchUrl,
  instructionApproveUrl,
  locationPinUrl,
  addressOfficeUrl,
  addressHotelUrl,
  addressVillaUrl,
  addressApartmentUrl,
  applePayWordmarkUrl,
  viewPricingUrl,
  contactServiceUrl,
  paymentSummaryUrl,
  paymentMethodUrl,
  promocodeUrl,
  creditUrl,
];

export function IconPreloader() {
  return (
    <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0 pointer-events-none">
      {ALL_ICON_URLS.map((url) => (
        <img key={url} src={url} alt="" loading="eager" decoding="async" />
      ))}
    </div>
  );
}