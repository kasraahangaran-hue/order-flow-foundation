import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { Button } from "@/components/ui/button";
import { AddressTypeTile } from "@/components/order/AddressTypeTile";
import type {
  Address,
  AddressType,
  ApartmentFields,
  HotelFields,
  OfficeFields,
  VillaFields,
} from "@/stores/orderStore";

const TYPES: AddressType[] = ["office", "hotel", "villa", "apartment"];

const TYPE_TITLE: Record<AddressType, string> = {
  apartment: "Apartment Details",
  villa: "Villa Details",
  hotel: "Hotel Details",
  office: "Office Details",
};

const inputClass =
  "h-12 w-full rounded-[6px] border border-washmen-pale-grey bg-white px-3 text-[14px] font-light leading-[20px] tracking-[0.1px] text-washmen-primary placeholder:text-washmen-cloudy-blue focus:border-washmen-primary focus:outline-none focus:ring-2 focus:ring-washmen-primary/20";

const noAutofill = {
  autoComplete: "new-password",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: false,
  name: "no-autofill",
  "data-1p-ignore": "true",
  "data-lpignore": "true",
  "data-form-type": "other",
} as const;

export default function AddressDetailsScreen() {
  const navigate = useNavigate();
  const pendingDraft = useOrderStore((s) => s.pendingAddressDraft);
  const setPendingAddressDraft = useOrderStore(
    (s) => s.setPendingAddressDraft,
  );
  const addAddress = useOrderStore((s) => s.addAddress);
  const updateAddress = useOrderStore((s) => s.updateAddress);
  const selectAddress = useOrderStore((s) => s.selectAddress);

  useEffect(() => {
    if (!pendingDraft) {
      navigate("/laundry/order-details/address/map", { replace: true });
      return;
    }
    if (!pendingDraft.type) {
      navigate("/laundry/order-details/address/type", { replace: true });
    }
  }, [pendingDraft, navigate]);

  const initialType = pendingDraft?.type ?? "apartment";
  const [type, setType] = useState<AddressType>(initialType);

  // Universal "place name" — maps to:
  // - apartment: building name
  // - office:    building name
  // - villa:     community / area
  // - hotel:     hotel name
  // Persists across tab switches so the user doesn't lose what they typed.
  const [placeName, setPlaceName] = useState(() => {
    const f = pendingDraft?.fields;
    if (!f) return "";
    if ("building" in f) return f.building; // apartment, office
    if ("community" in f) return f.community; // villa
    if ("hotelName" in f) return f.hotelName; // hotel
    return "";
  });

  // Universal "unit number" — maps to:
  // - apartment: apt #
  // - office:    office #
  // - villa:     villa #
  // - hotel:     room #
  // Persists across tab switches.
  const [unitNumber, setUnitNumber] = useState(() => {
    const f = pendingDraft?.fields;
    if (!f) return "";
    if ("aptNumber" in f) return f.aptNumber;
    if ("officeNumber" in f) return f.officeNumber;
    if ("villaNumber" in f) return f.villaNumber;
    if ("roomNumber" in f) return f.roomNumber;
    return "";
  });

  // Tab-specific extras — not shared across tabs because there's no
  // equivalent slot in the other types.
  const [villaStreet, setVillaStreet] = useState(
    (pendingDraft?.fields as VillaFields | undefined)?.street ?? "",
  );
  const [hotelGuest, setHotelGuest] = useState(
    (pendingDraft?.fields as HotelFields | undefined)?.guestName ?? "",
  );

  // Notes — persist across all tabs.
  const [notes, setNotes] = useState(
    (pendingDraft?.fields as { notes?: string } | undefined)?.notes ?? "",
  );

  const isEditMode = pendingDraft?.id !== undefined;

  const onSwitchType = (newType: AddressType) => {
    if (newType === type) return;
    haptics.light();
    setType(newType);
    // Don't clear placeName, unitNumber, notes — they're shared concepts.
    // Don't clear villaStreet / hotelGuest either — if the user comes back
    // to that tab, they'll find what they typed before.
  };

  const canContinue = useMemo(() => {
    const hasPlace = placeName.trim().length > 0;
    const hasUnit = unitNumber.trim().length > 0;
    switch (type) {
      case "apartment":
      case "office":
        return hasPlace && hasUnit;
      case "villa":
        return hasPlace && villaStreet.trim().length > 0 && hasUnit;
      case "hotel":
        return hasPlace && hasUnit && hotelGuest.trim().length > 0;
    }
  }, [type, placeName, unitNumber, villaStreet, hotelGuest]);

  // Early return AFTER all hooks have run, to satisfy Rules of Hooks. The
  // useEffect above redirects when pendingDraft is missing, so this only
  // renders briefly during the redirect.
  if (!pendingDraft || !pendingDraft.type) return null;

  const onBack = () => {
    haptics.light();
    navigate("/laundry/order-details/address/type");
  };

  const onContinue = () => {
    if (!canContinue) return;
    haptics.medium();

    const trimmedNotes = notes.trim();
    const baseShared = {
      lat: pendingDraft.lat,
      lng: pendingDraft.lng,
      formattedAddress: pendingDraft.formattedAddress,
    };
    const id = pendingDraft.id ?? `addr_${Date.now()}`;

    let address: Address;
    const trimmedPlace = placeName.trim();
    const trimmedUnit = unitNumber.trim();
    switch (type) {
      case "apartment":
        address = {
          id,
          type: "apartment",
          ...baseShared,
          fields: {
            building: trimmedPlace,
            aptNumber: trimmedUnit,
            ...(trimmedNotes ? { notes: trimmedNotes } : {}),
          },
        };
        break;
      case "office":
        address = {
          id,
          type: "office",
          ...baseShared,
          fields: {
            building: trimmedPlace,
            officeNumber: trimmedUnit,
            ...(trimmedNotes ? { notes: trimmedNotes } : {}),
          },
        };
        break;
      case "villa":
        address = {
          id,
          type: "villa",
          ...baseShared,
          fields: {
            community: trimmedPlace,
            street: villaStreet.trim(),
            villaNumber: trimmedUnit,
            ...(trimmedNotes ? { notes: trimmedNotes } : {}),
          },
        };
        break;
      case "hotel":
        address = {
          id,
          type: "hotel",
          ...baseShared,
          fields: {
            hotelName: trimmedPlace,
            roomNumber: trimmedUnit,
            guestName: hotelGuest.trim(),
            ...(trimmedNotes ? { notes: trimmedNotes } : {}),
          },
        };
        break;
    }

    if (isEditMode) {
      updateAddress(address);
      selectAddress(address.id);
    } else {
      addAddress(address);
    }
    setPendingAddressDraft(null);
    navigate("/laundry/order-details");
  };

  const titleVerb = isEditMode ? "Edit" : "Add";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center gap-2 px-6 py-3">
        <button
          onClick={onBack}
          className="press-effect flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-washmen-primary" />
        </button>
      </div>

      <div className="flex-1 space-y-4 px-6 pb-4">
        <h1 className="text-[20px] font-semibold text-washmen-primary">
          {titleVerb} {TYPE_TITLE[type]}
        </h1>

        {/* Type chips */}
        <div className="-mx-6 overflow-x-auto px-6">
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <AddressTypeTile
                key={t}
                type={t}
                selected={type === t}
                onSelect={() => onSwitchType(t)}
                variant="chip"
              />
            ))}
          </div>
        </div>

        {type === "apartment" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                {...noAutofill}
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="Building name"
                className={inputClass}
              />
              <input
                {...noAutofill}
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="Apt #"
                className={inputClass}
              />
            </div>
            <NotesField notes={notes} setNotes={setNotes} />
          </div>
        ) : null}

        {type === "office" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                {...noAutofill}
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="Building name"
                className={inputClass}
              />
              <input
                {...noAutofill}
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="Office #"
                className={inputClass}
              />
            </div>
            <NotesField notes={notes} setNotes={setNotes} />
          </div>
        ) : null}

        {type === "villa" ? (
          <div className="space-y-3">
            <input
              {...noAutofill}
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="Community / Area"
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                {...noAutofill}
                value={villaStreet}
                onChange={(e) => setVillaStreet(e.target.value)}
                placeholder="Street"
                className={inputClass}
              />
              <input
                {...noAutofill}
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="Villa #"
                className={inputClass}
              />
            </div>
            <NotesField notes={notes} setNotes={setNotes} />
          </div>
        ) : null}

        {type === "hotel" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                {...noAutofill}
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="Hotel Name"
                className={inputClass}
              />
              <input
                {...noAutofill}
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="Room #"
                className={inputClass}
              />
            </div>
            <input
              {...noAutofill}
              value={hotelGuest}
              onChange={(e) => setHotelGuest(e.target.value)}
              placeholder="Guest full name (for reception)"
              className={inputClass}
            />
            <NotesField notes={notes} setNotes={setNotes} />
          </div>
        ) : null}
      </div>

      <div className="border-t border-border bg-card pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="px-6 pt-3 pb-4">
          <Button
            className="h-[42px] w-full rounded-[8px] text-sm font-semibold"
            onClick={onContinue}
            disabled={!canContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

interface NotesFieldProps {
  notes: string;
  setNotes: (s: string) => void;
}

function NotesField({ notes, setNotes }: NotesFieldProps) {
  return (
    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      placeholder="Notes (optional)"
      rows={2}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="sentences"
      spellCheck
      className="w-full resize-none rounded-[6px] border border-washmen-pale-grey bg-white px-3 py-3 text-[14px] font-light leading-[20px] tracking-[0.1px] text-washmen-primary placeholder:text-washmen-cloudy-blue focus:border-washmen-primary focus:outline-none focus:ring-2 focus:ring-washmen-primary/20"
    />
  );
}
