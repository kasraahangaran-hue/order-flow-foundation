/// <reference types="@types/google.maps" />
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  loadMaps,
  DUBAI_CENTER,
  DUBAI_BOUNDS,
  FAR_PIN_THRESHOLD_METERS,
  distanceMeters,
} from "@/lib/google-maps";
// Map-pin SVG. Designed at 40×52 with the geographic tip at the bottom-
// center of the viewBox. The tip = source of truth for the user's pinned
// coordinate, so the wrapper anchors the bottom of this asset to the
// viewport center via -translate-y-full.
import locationPinUrl from "@/assets/icons/location-pin.svg";

interface Suggestion {
  placeId: string;
  primary: string;
  secondary: string;
}

export default function AddressMapScreen() {
  const navigate = useNavigate();
  const pendingDraft = useOrderStore((s) => s.pendingAddressDraft);
  const setPendingAddressDraft = useOrderStore(
    (s) => s.setPendingAddressDraft,
  );

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const idleListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const reverseTimerRef = useRef<number | null>(null);
  const autocompleteReqIdRef = useRef(0);
  /** User's last-known GPS position. Used for the far-pin warning. */
  const userGpsRef = useRef<{ lat: number; lng: number } | null>(null);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [center, setCenter] = useState<{
    lat: number;
    lng: number;
    label: string;
  }>({
    ...DUBAI_CENTER,
    label: "Dubai, United Arab Emirates",
  });
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);

  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    setReverseLoading(true);
    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results, status) => {
        setReverseLoading(false);
        if (status === "OK" && results && results[0]) {
          setCenter({ lat, lng, label: results[0].formatted_address });
        } else {
          setCenter({
            lat,
            lng,
            label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          });
        }
      },
    );
  };

  // Initialize map once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadMaps();
        if (cancelled || !mapDivRef.current) return;

        const initial = pendingDraft
          ? { lat: pendingDraft.lat, lng: pendingDraft.lng }
          : DUBAI_CENTER;

        const map = new google.maps.Map(mapDivRef.current, {
          center: initial,
          zoom: 17,
          minZoom: 6,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          clickableIcons: false,
        });
        mapRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();
        sessionTokenRef.current =
          new google.maps.places.AutocompleteSessionToken();

        idleListenerRef.current = map.addListener("idle", () => {
          const c = map.getCenter();
          if (!c) return;
          const lat = c.lat();
          const lng = c.lng();
          if (reverseTimerRef.current)
            window.clearTimeout(reverseTimerRef.current);
          reverseTimerRef.current = window.setTimeout(
            () => reverseGeocode(lat, lng),
            250,
          );
        });

        if (pendingDraft) {
          setCenter({
            lat: pendingDraft.lat,
            lng: pendingDraft.lng,
            label: pendingDraft.formattedAddress,
          });
        } else {
          reverseGeocode(initial.lat, initial.lng);
          if ("geolocation" in navigator) {
            setLocating(true);
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                if (cancelled || !mapRef.current) return;
                setLocating(false);
                userGpsRef.current = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                };
                mapRef.current.panTo(userGpsRef.current);
                mapRef.current.setZoom(18);
              },
              () => {
                setLocating(false);
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
            );
          }
        }

        setMapReady(true);
      } catch (e) {
        console.error("Failed to load Google Maps", e);
        toast({
          title: "Map failed to load",
          description: "Please check your connection and reload.",
        });
      }
    })();

    return () => {
      cancelled = true;
      if (idleListenerRef.current) idleListenerRef.current.remove();
      if (reverseTimerRef.current)
        window.clearTimeout(reverseTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autocomplete (debounced, regional + locational bias for Dubai/UAE).
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const reqId = ++autocompleteReqIdRef.current;
    const handle = window.setTimeout(async () => {
      try {
        const { suggestions: preds } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            {
              input: q,
              sessionToken: sessionTokenRef.current!,
              includedRegionCodes: ["ae"],
              locationBias: DUBAI_BOUNDS,
            },
          );
        if (reqId !== autocompleteReqIdRef.current) return;
        setSuggestions(
          preds.slice(0, 6).flatMap((s) => {
            const p = s.placePrediction;
            if (!p) return [];
            return [
              {
                placeId: p.placeId,
                primary: p.mainText?.text ?? p.text?.text ?? "",
                secondary: p.secondaryText?.text ?? "",
              },
            ];
          }),
        );
      } catch (e) {
        console.error("Autocomplete error", e);
        if (reqId === autocompleteReqIdRef.current) setSuggestions([]);
      }
    }, 200);
    return () => window.clearTimeout(handle);
  }, [search]);

  const onPickSuggestion = async (s: Suggestion) => {
    if (!mapRef.current) return;
    try {
      const place = new google.maps.places.Place({ id: s.placeId });
      await place.fetchFields({ fields: ["location", "formattedAddress"] });
      const loc = place.location;
      if (!loc) {
        toast({ title: "Could not load place" });
        return;
      }
      mapRef.current.panTo(loc);
      mapRef.current.setZoom(18);
      setSearch("");
      setSuggestions([]);
      sessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken();
    } catch (e) {
      console.error("Place details error", e);
      toast({ title: "Could not load place" });
    }
  };

  const onLocateMe = () => {
    haptics.light();
    if (!("geolocation" in navigator)) {
      toast({ title: "Location not supported" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        userGpsRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        if (mapRef.current) {
          mapRef.current.panTo(userGpsRef.current);
          mapRef.current.setZoom(18);
        }
      },
      (err) => {
        setLocating(false);
        toast({
          title: "Could not get location",
          description:
            err.code === err.PERMISSION_DENIED
              ? "Permission denied. Enable location access in your browser settings."
              : "Please try again.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const isFarFromGps = useMemo(() => {
    if (!userGpsRef.current) return false;
    return (
      distanceMeters(
        { lat: center.lat, lng: center.lng },
        userGpsRef.current,
      ) > FAR_PIN_THRESHOLD_METERS
    );
  }, [center.lat, center.lng]);

  /**
   * True when the map center is within ~30m of the user's GPS location.
   * Drives the locate-me button's active (filled) state.
   */
  const isAtUserLocation = useMemo(() => {
    if (!userGpsRef.current) return false;
    return (
      distanceMeters(
        { lat: center.lat, lng: center.lng },
        userGpsRef.current,
      ) < 30
    );
  }, [center.lat, center.lng]);

  const onBack = () => {
    haptics.light();
    setPendingAddressDraft(null);
    navigate("/laundry/order-details");
  };

  const onConfirm = () => {
    if (!mapReady) return;
    haptics.medium();
    setPendingAddressDraft({
      ...(pendingDraft ?? {}),
      lat: center.lat,
      lng: center.lng,
      formattedAddress: center.label,
    });
    navigate("/laundry/order-details/address/type");
  };

  const showSuggestions = suggestions.length > 0;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Real Google Map */}
      <div ref={mapDivRef} className="absolute inset-0" />

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
          <Loader2 className="h-6 w-6 animate-spin text-washmen-primary" />
        </div>
      )}

      {/* Centered pin (anchored to viewport center via -translate-y-full).
          The pin SVG's tip sits at the very bottom of its viewBox, so the
          bottom edge of the wrapper = the geographic source of truth. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
        <img
          src={locationPinUrl}
          alt=""
          aria-hidden="true"
          className="h-12 w-auto [filter:drop-shadow(0_4px_6px_hsl(var(--washmen-primary)/0.35))]"
        />
      </div>

      {/* Top: back + search */}
      <div className="absolute left-0 right-0 top-0 z-20 px-4 pt-3">
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-md">
          <button
            onClick={onBack}
            className="press-effect flex h-8 w-8 items-center justify-center rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-washmen-primary" />
          </button>
          <Search className="h-4 w-4 text-washmen-slate-grey" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a building or community"
            type="search"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            name="no-autofill-search"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-washmen-slate-grey"
          />
          {search ? (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                haptics.light();
                setSearch("");
              }}
              aria-label="Clear search"
              className="press-effect flex h-6 w-6 items-center justify-center"
            >
              <X className="h-4 w-4 text-washmen-slate-grey" />
            </button>
          ) : null}
        </div>

        {showSuggestions ? (
          <div className="mt-2 overflow-hidden rounded-2xl bg-white shadow-md">
            {suggestions.map((m, i) => (
              <button
                key={m.placeId}
                onClick={() => onPickSuggestion(m)}
                className={
                  "press-effect flex w-full items-start gap-3 px-4 py-3 text-left " +
                  (i < suggestions.length - 1
                    ? "border-b border-washmen-pale-grey"
                    : "")
                }
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-3.5 w-3.5 text-washmen-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-washmen-primary">
                    {m.primary}
                  </div>
                  {m.secondary ? (
                    <div className="truncate text-[12px] text-washmen-slate-grey">
                      {m.secondary}
                    </div>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Locate-me FAB. Active (filled) when the pin is at the user's GPS
          location; inactive (stroke only) otherwise. */}
      <button
        onClick={onLocateMe}
        aria-label="Locate me"
        aria-pressed={isAtUserLocation}
        className="press-effect absolute bottom-44 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg"
      >
        {locating ? (
          <Loader2 className="h-5 w-5 animate-spin text-washmen-primary" />
        ) : (
          <Navigation
            className={cn(
              "h-5 w-5 text-washmen-primary transition-colors",
              isAtUserLocation && "fill-washmen-primary"
            )}
          />
        )}
      </button>

      {/* Bottom: warning + footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-border bg-card pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="px-6 pt-3 pb-4">
        {isFarFromGps ? (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-[13px] text-amber-800">
              You seem far away from this pin
            </span>
          </div>
        ) : null}
        {reverseLoading ? (
          <div className="mb-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-washmen-slate-grey" />
            <span className="text-[13px] text-washmen-slate-grey">
              Looking up location…
            </span>
          </div>
        ) : (
          <div className="mb-2 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-washmen-primary" />
            <span className="text-[13px] text-washmen-primary line-clamp-2">
              {center.label}
            </span>
          </div>
        )}
        <Button
          className="h-[42px] w-full rounded-[8px] text-sm font-semibold"
          onClick={onConfirm}
          disabled={!mapReady}
        >
          Confirm Pin
        </Button>
        </div>
      </div>
    </div>
  );
}
