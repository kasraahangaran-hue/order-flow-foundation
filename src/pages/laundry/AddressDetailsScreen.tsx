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
  "h-12 w-full rounded-[6px] border border-[#f2f3f8] bg-white px-3 text-[14px] font-light leading-[20px] tracking-[0.1px] text-washmen-primary placeholder:text-[#c3c8db] focus:border-washmen-primary focus:outline-none focus:ring-2 focus:ring-washmen-primary/20";

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

  // Apartment
  const [aptBuilding, setAptBuilding] = useState(
    (pendingDraft?.fields as ApartmentFields | undefined)?.building ?? "",
  );
  const [aptNumber, setAptNumber] = useState(
    (pendingDraft?.fields as ApartmentFields | undefined)?.aptNumber ?? "",
  );

  // Office
  const [officeBuilding, setOfficeBuilding] = useState(
    (pendingDraft?.fields as OfficeFields | undefined)?.building ?? "",
  );
  const [officeNumber, setOfficeNumber] = useState(
    (pendingDraft?.fields as OfficeFields | undefined)?.officeNumber ?? "",
  );

  // Villa
  const [villaCommunity, setVillaCommunity] = useState(
    (pendingDraft?.fields as VillaFields | undefined)?.community ?? "",
  );
  const [villaStreet, setVillaStreet] = useState(
    (pendingDraft?.fields as VillaFields | undefined)?.street ?? "",
  );
  const [villaNumber, setVillaNumber] = useState(
    (pendingDraft?.fields as VillaFields | undefined)?.villaNumber ?? "",
  );

  // Hotel
  const [hotelName, setHotelName] = useState(
    (pendingDraft?.fields as HotelFields | undefined)?.hotelName ?? "",
  );
  const [hotelRoom, setHotelRoom] = useState(
    (pendingDraft?.fields as HotelFields | undefined)?.roomNumber ?? "",
  );
  const [hotelGuest, setHotelGuest] = useState(
    (pendingDraft?.fields as HotelFields | undefined)?.guestName ?? "",
  );

  const [notes, setNotes] = useState(
    (pendingDraft?.fields as { notes?: string } | undefined)?.notes ?? "",
  );

  if (!pendingDraft || !pendingDraft.type) return null;

  const isEditMode = pendingDraft.id !== undefined;

  const onSwitchType = (newType: AddressType) => {
    if (newType === type) return;
    haptics.light();
    setType(newType);
    setAptBuilding("");
    setAptNumber("");
    setOfficeBuilding("");
    setOfficeNumber("");
    setVillaCommunity("");
    setVillaStreet("");
    setVillaNumber("");
    setHotelName("");
    setHotelRoom("");
    setHotelGuest("");
    setNotes("");
  };

  const canContinue = useMemo(() => {
    switch (type) {
      case "apartment":
        return aptBuilding.trim().length > 0 && aptNumber.trim().length > 0;
      case "office":
        return (
          officeBuilding.trim().length > 0 && officeNumber.trim().length > 0
        );
      case "villa":
        return (
          villaCommunity.trim().length > 0 &&
          villaStreet.trim().length > 0 &&
          villaNumber.trim().length > 0
        );
      case "hotel":
        return (
          hotelName.trim().length > 0 &&
          hotelRoom.trim().length > 0 &&
          hotelGuest.trim().length > 0
        );
    }
  }, [
    type,
    aptBuilding,
    aptNumber,
    officeBuilding,
    officeNumber,
    villaCommunity,
    villaStreet,
    villaNumber,
    hotelName,
    hotelRoom,
    hotelGuest,
  ]);

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
    switch (type) {
      case "apartment":
        address = {
          id,
          type: "apartment",
          ...baseShared,
          fields: {
            building: aptBuilding.trim(),
            aptNumber: aptNumber.trim(),
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
            building: officeBuilding.trim(),
            officeNumber: officeNumber.trim(),
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
            community: villaCommunity.trim(),
            street: villaStreet.trim(),
            villaNumber: villaNumber.trim(),
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
            hotelName: hotelName.trim(),
            roomNumber: hotelRoom.trim(),
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
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-washmen-primary" />
        </button>
      </div>

      <div className="flex-1 space-y-4 px-4 pb-4">
        <h1 className="text-[20px] font-semibold text-washmen-primary">
          {titleVerb} {TYPE_TITLE[type]}
        </h1>

        {/* Type chips */}
        <div className="-mx-4 overflow-x-auto px-4">
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
                value={aptBuilding}
                onChange={(e) => setAptBuilding(e.target.value)}
                placeholder="Building name"
                className={inputClass}
              />
              <input
                {...noAutofill}
                value={aptNumber}
                onChange={(e) => setAptNumber(e.target.value)}
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
                value={officeBuilding}
                onChange={(e) => setOfficeBuilding(e.target.value)}
                placeholder="Building name"
                className={inputClass}
              />
              <input
                {...noAutofill}
                value={officeNumber}
                onChange={(e) => setOfficeNumber(e.target.value)}
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
              value={villaCommunity}
              onChange={(e) => setVillaCommunity(e.target.value)}
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
                value={villaNumber}
                onChange={(e) => setVillaNumber(e.target.value)}
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
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="Hotel Name"
                className={inputClass}
              />
              <input
                {...noAutofill}
                value={hotelRoom}
                onChange={(e) => setHotelRoom(e.target.value)}
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

      <div className="border-t border-border bg-card p-4">
        <Button
          className="h-12 w-full text-sm font-semibold"
          onClick={onContinue}
          disabled={!canContinue}
        >
          Continue
        </Button>
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
      className="w-full resize-none rounded-[6px] border border-[#f2f3f8] bg-white px-3 py-3 text-[14px] font-light leading-[20px] tracking-[0.1px] text-washmen-primary placeholder:text-[#c3c8db] focus:border-washmen-primary focus:outline-none focus:ring-2 focus:ring-washmen-primary/20"
    />
  );
}
