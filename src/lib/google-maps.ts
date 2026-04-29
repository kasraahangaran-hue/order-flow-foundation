/// <reference types="@types/google.maps" />
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

// Domain-restricted Google Maps JS API key — safe to ship client-side.
// IMPORTANT: This key is restricted by HTTP referrer in the Google Cloud
// Console. If the prototype is deployed to a domain not covered by the
// existing restrictions, requests will fail and the map won't load. In
// that case, generate a new key at https://console.cloud.google.com/ and
// add the new domain to the referrer allow-list.
export const GOOGLE_MAPS_API_KEY = "AIzaSyBsi97LkyVUSMz1si8g9aQ4ebQu2ZeTwsA";

let initialized = false;

function ensureInit() {
  if (initialized) return;
  setOptions({ key: GOOGLE_MAPS_API_KEY, v: "weekly" });
  initialized = true;
}

export async function loadMaps() {
  ensureInit();
  const [maps, places, geocoding, marker] = await Promise.all([
    importLibrary("maps"),
    importLibrary("places"),
    importLibrary("geocoding"),
    importLibrary("marker"),
  ]);
  return { maps, places, geocoding, marker };
}

export const DUBAI_CENTER = { lat: 25.2048, lng: 55.2708 };

export const DUBAI_BOUNDS = {
  north: 25.35,
  south: 24.85,
  east: 55.55,
  west: 54.9,
};

/**
 * Threshold (meters) used to determine if the picked pin is "far" from the
 * user's actual GPS location. When exceeded, a soft warning ("You seem far
 * away from this pin") is shown but Confirm Pin remains enabled.
 *
 * TUNE THIS: 2km is a reasonable default for a delivery service in Dubai.
 * Adjust based on UX research — too low triggers false positives in dense
 * mixed-use areas; too high renders the warning useless.
 */
export const FAR_PIN_THRESHOLD_METERS = 2000;

/**
 * Haversine distance between two lat/lng points, in meters.
 * Used for the far-pin warning calculation.
 */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000; // Earth radius (m)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
