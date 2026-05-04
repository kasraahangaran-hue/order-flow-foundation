import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Camera, Check, ChevronRight } from "lucide-react";
import stainIconUrl from "@/assets/icons/instruction-stain.svg";
import cleaningIconUrl from "@/assets/icons/instruction-cleaning.svg";
import othersIconUrl from "@/assets/icons/instruction-others.svg";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { CameraCaptureSheet } from "@/components/order/CameraCaptureSheet";
import { StainSheet } from "@/components/order/StainSheet";
import { CleaningInstructionsSheet } from "@/components/order/CleaningInstructionsSheet";
import { OthersSheet } from "@/components/order/OthersSheet";
import type {
  StainType,
  CleaningInstruction,
  OtherFlag,
} from "@/stores/orderStore";

export default function PhotoMetadata() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const orderInstructions = useOrderStore((s) => s.orderInstructions);
  const setOrderInstructions = useOrderStore((s) => s.setOrderInstructions);

  const item = useMemo(
    () => orderInstructions?.delicateItems?.find((d) => d.id === id) ?? null,
    [orderInstructions?.delicateItems, id],
  );

  const delicateItems = orderInstructions?.delicateItems ?? [];

  const [brand, setBrand] = useState(item?.brand ?? "");
  const [stains, setStains] = useState<StainType[]>(item?.stains ?? []);
  const [cleaningInstruction, setCleaningInstruction] =
    useState<CleaningInstruction>(item?.cleaningInstruction ?? "no_preference");
  const [others, setOthers] = useState<OtherFlag[]>(item?.others ?? []);
  const [photo, setPhoto] = useState(item?.photo ?? "");

  const [stainSheetOpen, setStainSheetOpen] = useState(false);
  const [cleaningSheetOpen, setCleaningSheetOpen] = useState(false);
  const [othersSheetOpen, setOthersSheetOpen] = useState(false);
  const [retakeCameraOpen, setRetakeCameraOpen] = useState(false);

  useEffect(() => {
    if (!id || !item) {
      navigate("/laundry/order-instructions", { replace: true });
    }
  }, [id, item, navigate]);

  useEffect(() => {
    if (item) setPhoto(item.photo);
  }, [item]);

  if (!item) return null;

  const stainConfigured = stains.length > 0;
  const cleaningConfigured = cleaningInstruction !== "no_preference";
  const othersConfigured = others.length > 0;
  const anyCategoryConfigured =
    stainConfigured || cleaningConfigured || othersConfigured;
  const saveEnabled = brand.trim().length > 0 && anyCategoryConfigured;

  const onSave = () => {
    if (!saveEnabled) return;
    haptics.medium();
    setOrderInstructions({
      delicateItems: delicateItems.map((d) =>
        d.id === item.id
          ? {
              ...d,
              brand: brand.trim(),
              stains,
              cleaningInstruction,
              others,
              photo,
            }
          : d,
      ),
    });
    navigate("/laundry/order-instructions");
  };

  const onBack = () => {
    haptics.light();
    // If the user backed out of a brand-new capture without configuring anything,
    // discard the empty draft item so we don't leave a stale entry in the store.
    const isDraftEmpty =
      brand.trim().length === 0 &&
      stains.length === 0 &&
      cleaningInstruction === "no_preference" &&
      others.length === 0;
    if (isDraftEmpty) {
      setOrderInstructions({
        delicateItems: delicateItems.filter((d) => d.id !== item.id),
      });
    }
    navigate("/laundry/order-instructions");
  };

  const onRetakeCaptured = (dataUrl: string) => {
    setPhoto(dataUrl);
    setRetakeCameraOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-washmen-bg">
      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pt-6 pb-32">
        {/* Photo with retake overlay */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={photo}
              alt="Delicate item"
              className="h-[220px] w-[220px] rounded-[12px] object-cover"
            />
            <button
              type="button"
              onClick={() => {
                haptics.light();
                setRetakeCameraOpen(true);
              }}
              aria-label="Retake photo"
              className="press-effect absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-washmen-slate-grey text-white shadow-md"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Brand input */}
        <div className="mt-8">
          <label className="text-[14px] font-medium leading-[20px] text-washmen-primary">
            What's the name of the brand?
          </label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value.slice(0, 15))}
            maxLength={15}
            placeholder="Enter brand (max 15 characters)"
            className="mt-2 h-12 w-full rounded-[6px] border border-washmen-pale-grey bg-white px-3 text-[14px] font-light leading-[20px] tracking-[0.1px] text-washmen-primary placeholder:text-washmen-cloudy-blue focus:border-washmen-primary focus:outline-none focus:ring-2 focus:ring-washmen-primary/20"
          />
        </div>

        <p className="mt-6 text-[12px] font-light leading-[18px] tracking-[0.1px] text-washmen-slate-grey">
          Let us know which items are delicate or have stains
        </p>

        <div className="mt-3 flex flex-col gap-2">
          <CategoryCard
            iconUrl={stainIconUrl}
            title="Report Stain"
            configured={stainConfigured}
            onTap={() => {
              haptics.light();
              setStainSheetOpen(true);
            }}
          />
          <CategoryCard
            iconUrl={cleaningIconUrl}
            title="Cleaning Instructions"
            configured={cleaningConfigured}
            onTap={() => {
              haptics.light();
              setCleaningSheetOpen(true);
            }}
          />
          <CategoryCard
            iconUrl={othersIconUrl}
            title="Others"
            configured={othersConfigured}
            onTap={() => {
              haptics.light();
              setOthersSheetOpen(true);
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="fixed inset-x-0 bottom-0 border-t border-washmen-pale-grey bg-white pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="flex items-center gap-2 px-6 pt-3 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="press-effect flex w-12 h-[42px] items-center justify-center rounded-[8px] border border-washmen-primary bg-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4 text-washmen-primary" />
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!saveEnabled}
            className="press-effect h-[42px] flex-1 rounded-[8px] bg-washmen-primary text-[14px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>

      <StainSheet
        open={stainSheetOpen}
        onOpenChange={setStainSheetOpen}
        initialValue={stains}
        onApply={setStains}
      />
      <CleaningInstructionsSheet
        open={cleaningSheetOpen}
        onOpenChange={setCleaningSheetOpen}
        initialValue={cleaningInstruction}
        onApply={setCleaningInstruction}
      />
      <OthersSheet
        open={othersSheetOpen}
        onOpenChange={setOthersSheetOpen}
        initialValue={others}
        onApply={setOthers}
      />
      <CameraCaptureSheet
        open={retakeCameraOpen}
        onClose={() => setRetakeCameraOpen(false)}
        onCapture={onRetakeCaptured}
      />
    </div>
  );
}

interface CategoryCardProps {
  iconUrl: string;
  title: string;
  configured: boolean;
  onTap: () => void;
}

function CategoryCard({ iconUrl, title, configured, onTap }: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="press-effect flex items-center gap-3 rounded-[8px] border border-washmen-pale-grey bg-white px-4 py-3 text-left"
    >
      <img
        src={iconUrl}
        alt=""
        className="h-10 w-10 shrink-0 select-none"
        draggable={false}
      />
      <span className="flex-1 text-[14px] font-normal leading-[20px] tracking-[0.1px] text-washmen-primary">
        {title}
      </span>
      {configured ? (
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-washmen-primary-green">
          <Check className="h-3 w-3 text-washmen-primary" strokeWidth={3} />
        </span>
      ) : (
        <ChevronRight className="h-4 w-4 text-washmen-secondary-500" />
      )}
    </button>
  );
}