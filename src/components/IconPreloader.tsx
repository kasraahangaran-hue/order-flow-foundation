/**
 * Aggressively preloads every icon SVG used in the app at App mount.
 *
 * Uses Image.decode() instead of hidden <img> tags because hidden imgs
 * can have their decoding deferred indefinitely by the browser (opacity-0
 * + h-0 w-0 elements may never trigger a paint, which is when decoding
 * normally happens). decode() forces the browser to fully decode each
 * SVG into memory IMMEDIATELY, so subsequent <img src={...}> usages
 * paint with zero latency.
 *
 * Add new icon imports to this file whenever a new icon is integrated.
 */
import { useEffect } from "react";

// Service tile icons
import washFoldIconUrl from "@/assets/icons/service-wash-fold.svg";
import cleanPressIconUrl from "@/assets/icons/service-clean-press.svg";
import bedBathIconUrl from "@/assets/icons/service-bed-bath.svg";
import pressOnlyIconUrl from "@/assets/icons/service-press-only.svg";

// Add Pressing toggle states
import addPressingActiveUrl from "@/assets/icons/add-pressing-active.svg";
import addPressingInactiveUrl from "@/assets/icons/add-pressing-inactive.svg";

// Bag icons
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

// Last Step / payment / pricing
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

/**
 * Module-level cache pinning the decoded Image objects so the browser
 * doesn't garbage-collect them. As long as these references live, the
 * decoded pixels stay in memory and any <img src={url}> in the app
 * paints instantly.
 */
const decodedCache: HTMLImageElement[] = [];

export function IconPreloader() {
  useEffect(() => {
    // Bail if already decoded (StrictMode double-mount protection).
    if (decodedCache.length === ALL_ICON_URLS.length) return;

    let cancelled = false;
    Promise.all(
      ALL_ICON_URLS.map((url) => {
        const img = new Image();
        img.src = url;
        // decode() returns a promise that resolves once the image is
        // fully decoded into GPU-ready memory. After this resolves,
        // any future <img src={url}> paints in zero time.
        return img
          .decode()
          .then(() => img)
          .catch(() => {
            // SVGs occasionally fail decode in some browsers; fall back
            // to a plain load. Still better than no preload at all.
            return new Promise<HTMLImageElement>((resolve) => {
              img.onload = () => resolve(img);
              img.onerror = () => resolve(img);
            });
          });
      }),
    ).then((images) => {
      if (cancelled) return;
      decodedCache.push(...images);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
