import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Camera,
  Layers,
  Pencil,
  Plus,
  Shirt,
  SprayCan,
  X,
} from "lucide-react";
import { OrderLayout } from "@/components/order/OrderLayout";
import { InstructionsCard } from "@/components/order/InstructionsCard";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import type { OrderInstructionsState } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";

// TEMP: dummy photos for UI dev. Replace with real native camera/picker when bridge is ready.
const DUMMY_PHOTOS = [
  "https://images.unsplash.com/photo-1521566652839-697aa473761a?w=160&h=160&fit=crop",
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=160&h=160&fit=crop",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=160&h=160&fit=crop",
  "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=160&h=160&fit=crop",
];

export default function OrderInstructions() {
  const navigate = useNavigate();
  const orderInstructions = useOrderStore((s) => s.orderInstructions);
  const setOrderInstructions = useOrderStore((s) => s.setOrderInstructions);

  const specialRequests = orderInstructions?.specialRequests ?? "";
  const photos = orderInstructions?.photos ?? [];
  const folding = orderInstructions?.folding ?? null;
  const creases = orderInstructions?.creases ?? null;
  const starch = orderInstructions?.starch ?? null;
  const autoApprovals = orderInstructions?.autoApprovals ?? false;

  const [photoExpanded, setPhotoExpanded] = useState(false);

  const hasAnyInstruction =
    Boolean(specialRequests.trim()) ||
    photos.length > 0 ||
    Boolean(folding) ||
    Boolean(creases) ||
    Boolean(starch) ||
    Boolean(autoApprovals);

  const addDummyPhoto = () => {
    haptics.light();
    const next = DUMMY_PHOTOS[photos.length % DUMMY_PHOTOS.length];
    setOrderInstructions({ photos: [...photos, next] });
  };

  const removePhoto = (idx: number) => {
    haptics.light();
    setOrderInstructions({ photos: photos.filter((_, i) => i !== idx) });
  };

  const togglePhotoCard = () => {
    haptics.light();
    setPhotoExpanded((v) => !v);
  };

  // TEMP: tap to toggle dummy data for UI dev. Replace with nativeBridge.openSheet() when sheets are wired up.
  const toggle = <K extends keyof OrderInstructionsState>(
    key: K,
    dummyValue: OrderInstructionsState[K],
  ) => {
    const current = orderInstructions?.[key];
    const cleared = key === "autoApprovals" ? (false as OrderInstructionsState[K]) : (null as OrderInstructionsState[K]);
    setOrderInstructions({ [key]: current ? cleared : dummyValue } as Partial<OrderInstructionsState>);
    haptics.light();
  };

  return (
    <OrderLayout
      title="Order Instructions (optional)"
      step={3}
      onBack={() => navigate(-1)}
      footerSlot={
        <Button
          className="flex-1 h-12 text-sm font-semibold"
          onClick={() => {
            haptics.medium();
            navigate("/laundry/last-step");
          }}
        >
          {hasAnyInstruction ? "Continue to Order" : "Skip"}
        </Button>
      }
    >
      <div className="flex flex-col gap-2">
        {/* 1. Special Requests */}
        <div className="rounded-card bg-card p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-base font-semibold text-washmen-secondary-900">
            Any Special Requests?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-washmen-secondary-500">
            Your requests will be shared to the customer service team to action
          </p>
          <textarea
            value={specialRequests}
            onChange={(e) => setOrderInstructions({ specialRequests: e.target.value })}
            placeholder="Add requests"
            className="mt-3 min-h-[80px] w-full rounded-md border border-washmen-secondary-200 bg-washmen-secondary-50 p-3 text-base text-washmen-secondary-900 placeholder:text-washmen-secondary-400 focus:border-washmen-primary focus:outline-none focus:ring-2 focus:ring-washmen-primary/20"
          />
        </div>

        {/* 2. Send a Photo */}
        <div className="rounded-card bg-card p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <button
            type="button"
            onClick={togglePhotoCard}
            className="press-effect flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-washmen-secondary-aqua">
                <Camera className="h-4 w-4 text-washmen-primary" />
              </div>
              <p className="text-base font-semibold text-washmen-secondary-900">
                Send a Photo
              </p>
            </div>
            {photoExpanded ? (
              <Pencil className="h-5 w-5 text-washmen-primary" strokeWidth={2} aria-hidden />
            ) : (
              <Plus className="h-5 w-5 text-washmen-primary" strokeWidth={2} aria-hidden />
            )}
          </button>
          {photoExpanded ? (
            <>
              <p className="mt-3 text-sm leading-relaxed text-washmen-secondary-500">
                You can upload additional photos and leave notes for our experts. We will
                contact you after reviewing them
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {photos.map((src, idx) => (
                  <div
                    key={`${src}-${idx}`}
                    className="relative h-20 w-20 overflow-hidden rounded-md"
                  >
                    <img
                      src={src}
                      alt={`Uploaded photo ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      aria-label={`Remove photo ${idx + 1}`}
                      className="press-effect absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDummyPhoto}
                  className="press-effect flex h-20 w-20 items-center justify-center rounded-md border-2 border-dashed border-washmen-secondary-300"
                  aria-label="Attach files"
                >
                  <Camera className="h-6 w-6 text-washmen-secondary-500" />
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* 3. Folding */}
        <InstructionsCard
          title="Folding"
          icon={Shirt}
          valueLabel={folding}
          onPress={() => toggle("folding", "T-Shirts, Pants")}
        />

        {/* 4. Creases */}
        <InstructionsCard
          title="Creases"
          icon={Layers}
          valueLabel={creases}
          onPress={() => toggle("creases", "Shirts: sleeve creases")}
        />

        {/* 5. Starch */}
        <InstructionsCard
          title="Starch"
          icon={SprayCan}
          valueLabel={starch}
          onPress={() => toggle("starch", "Light")}
        />

        {/* 6. Auto-Approvals */}
        <InstructionsCard
          title="Auto-Approvals"
          icon={BadgeCheck}
          valueLabel={
            autoApprovals ? "Stain and Damage Approval: Auto-approve" : null
          }
          onPress={() => toggle("autoApprovals", true)}
        />
      </div>
    </OrderLayout>
  );
}
