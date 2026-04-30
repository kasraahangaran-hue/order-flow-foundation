import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Layers,
  Pencil,
  Plus,
  Shirt,
  SprayCan,
  X,
  BadgeCheck,
} from "lucide-react";
import { OrderLayout } from "@/components/order/OrderLayout";
import { InstructionsCard } from "@/components/order/InstructionsCard";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { haptics } from "@/lib/haptics";
import { CreasesSheet } from "@/components/order/CreasesSheet";
import { StarchSheet } from "@/components/order/StarchSheet";
import { FoldingSheet } from "@/components/order/FoldingSheet";
import { AutoApprovalsSheet } from "@/components/order/AutoApprovalsSheet";
import { CameraCaptureSheet } from "@/components/order/CameraCaptureSheet";
import { DeleteItemDialog } from "@/components/order/DeleteItemDialog";
import {
  summarizeCreases,
  summarizeStarch,
  summarizeAutoApprovals,
  summarizeFolding,
  DEFAULT_CREASES,
  DEFAULT_STARCH,
  DEFAULT_AUTO_APPROVALS,
} from "@/lib/orderInstructionsLabels";
import { useUserPrefsStore } from "@/stores/userPrefsStore";

const MAX_DELICATE_ITEMS = 5;

export default function OrderInstructions() {
  const navigate = useNavigate();
  const orderInstructions = useOrderStore((s) => s.orderInstructions);
  const setOrderInstructions = useOrderStore((s) => s.setOrderInstructions);

  const specialRequests = orderInstructions?.specialRequests ?? "";
  const delicateItems = orderInstructions?.delicateItems ?? [];
  const folding = orderInstructions?.folding ?? null;
  const creases = orderInstructions?.creases ?? null;
  const starch = orderInstructions?.starch ?? null;
  const autoApprovals = orderInstructions?.autoApprovals ?? null;

  const [photoExpanded, setPhotoExpanded] = useState(
    () => (orderInstructions?.delicateItems?.length ?? 0) > 0,
  );
  const [creasesSheetOpen, setCreasesSheetOpen] = useState(false);
  const [starchSheetOpen, setStarchSheetOpen] = useState(false);
  const [foldingSheetOpen, setFoldingSheetOpen] = useState(false);
  const [autoApprovalsSheetOpen, setAutoApprovalsSheetOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const userPrefsFolding = useUserPrefsStore((s) => s.folding);
  const setUserPrefsFolding = useUserPrefsStore((s) => s.setFolding);

  const hasAnyInstruction =
    Boolean(specialRequests.trim()) ||
    delicateItems.length > 0 ||
    Boolean(folding) ||
    Boolean(creases) ||
    Boolean(starch) ||
    Boolean(autoApprovals);

  const togglePhotoCard = () => {
    haptics.light();
    setPhotoExpanded((v) => !v);
  };

  const openCamera = () => {
    if (delicateItems.length >= MAX_DELICATE_ITEMS) return;
    haptics.light();
    setCameraOpen(true);
  };

  const onPhotoCaptured = (dataUrl: string) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `item_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const newItem = {
      id,
      photo: dataUrl,
      brand: "",
      stains: [] as never[],
      cleaningInstruction: "no_preference" as const,
      others: [] as never[],
    };
    setOrderInstructions({
      delicateItems: [...delicateItems, newItem],
    });
    setCameraOpen(false);
    navigate(`/laundry/order-instructions/photo?id=${id}`);
  };

  const onConfirmDelete = () => {
    if (!pendingDeleteId) return;
    setOrderInstructions({
      delicateItems: delicateItems.filter((d) => d.id !== pendingDeleteId),
    });
    setPendingDeleteId(null);
  };

  const onThumbnailTap = (id: string) => {
    haptics.light();
    navigate(`/laundry/order-instructions/photo?id=${id}`);
  };

  return (
    <OrderLayout
      title="Order Instructions (optional)"
      step={3}
      onBack={() => navigate("/laundry/order-details")}
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
        <div className="rounded-card bg-white border border-washmen-pale-grey px-4 pt-[14px] pb-4">
          <p className="text-[14px] font-normal leading-[20px] tracking-[0.1px] text-washmen-primary">
            Any Special Requests?
          </p>
          <p className="mt-1 text-[12px] font-light leading-[18px] tracking-[0.1px] text-washmen-slate-grey">
            Your requests will be shared to the customer service team to action
          </p>
          <textarea
            value={specialRequests}
            onChange={(e) => setOrderInstructions({ specialRequests: e.target.value })}
            placeholder="Use fragrance-free detergent"
            className="mt-2 min-h-[80px] w-full rounded-[6px] border border-washmen-pale-grey bg-white p-3 text-[12px] font-light leading-[18px] tracking-[0.1px] text-foreground placeholder:text-washmen-cloudy-blue focus:border-washmen-primary focus:outline-none focus:ring-2 focus:ring-washmen-primary/20"
          />
        </div>

        {/* 2. Send a Photo */}
        <div className="rounded-card bg-white border border-washmen-pale-grey">
          <button
            type="button"
            onClick={togglePhotoCard}
            className="press-effect flex w-full items-center gap-2 px-4 py-[10px] text-left"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <Camera className="h-6 w-6 text-washmen-primary" />
            </div>
            <p className="flex-1 text-[14px] font-normal leading-[20px] tracking-[0.1px] text-washmen-primary">
              Send a Photo
            </p>
            {photoExpanded ? (
              <Pencil className="h-4 w-4 text-washmen-primary" strokeWidth={2} aria-hidden />
            ) : (
              <Plus className="h-4 w-4 text-washmen-primary" strokeWidth={2} aria-hidden />
            )}
          </button>
          {photoExpanded ? (
            <div className="px-4 pb-4">
              <p className="text-[12px] font-light leading-[18px] tracking-[0.1px] text-washmen-slate-grey">
                You can upload additional photos and leave notes for our experts. We will
                contact you after reviewing them
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={openCamera}
                  disabled={delicateItems.length >= MAX_DELICATE_ITEMS}
                  className="press-effect flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-washmen-secondary-300 disabled:opacity-50"
                  aria-label="Take a photo"
                >
                  <Camera className="h-6 w-6 text-washmen-secondary-500" />
                </button>
                {delicateItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square overflow-hidden rounded-md"
                  >
                    <button
                      type="button"
                      onClick={() => onThumbnailTap(item.id)}
                      className="press-effect h-full w-full"
                      aria-label={`Edit item ${item.brand || "(no brand)"}`}
                    >
                      <img
                        src={item.photo}
                        alt={item.brand || "Delicate item"}
                        className="h-full w-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(item.id)}
                      aria-label="Delete item"
                      className="press-effect absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* 3. Folding */}
        <InstructionsCard
          title="Folding"
          icon={Shirt}
          value={folding ? summarizeFolding(folding) : null}
          onPress={() => {
            haptics.light();
            setFoldingSheetOpen(true);
          }}
        />

        {/* 4. Creases */}
        <InstructionsCard
          title="Creases"
          icon={Layers}
          value={creases ? summarizeCreases(creases) : null}
          onPress={() => {
            haptics.light();
            setCreasesSheetOpen(true);
          }}
        />

        {/* 5. Starch */}
        <InstructionsCard
          title="Starch"
          icon={SprayCan}
          value={starch && starch !== "none" ? summarizeStarch(starch) : null}
          onPress={() => {
            haptics.light();
            setStarchSheetOpen(true);
          }}
        />

        {/* 6. Auto-Approvals */}
        <InstructionsCard
          title="Auto-Approvals"
          icon={BadgeCheck}
          value={autoApprovals ? summarizeAutoApprovals(autoApprovals) : null}
          onPress={() => {
            haptics.light();
            setAutoApprovalsSheetOpen(true);
          }}
        />
      </div>
      <CreasesSheet
        open={creasesSheetOpen}
        onOpenChange={setCreasesSheetOpen}
        initialValue={creases ?? DEFAULT_CREASES}
        onApply={(value) => setOrderInstructions({ creases: value })}
      />
      <StarchSheet
        open={starchSheetOpen}
        onOpenChange={setStarchSheetOpen}
        initialValue={starch ?? DEFAULT_STARCH}
        onApply={(value) => setOrderInstructions({ starch: value })}
      />
      <FoldingSheet
        open={foldingSheetOpen}
        onOpenChange={setFoldingSheetOpen}
        initialOrderValue={folding}
        userPrefValue={userPrefsFolding}
        onApplyToOrder={(value) => {
          setOrderInstructions({ folding: value });
        }}
        onApplyToFuture={(value) => {
          setOrderInstructions({ folding: value });
          setUserPrefsFolding(value);
        }}
      />
      <AutoApprovalsSheet
        open={autoApprovalsSheetOpen}
        onOpenChange={setAutoApprovalsSheetOpen}
        initialValue={autoApprovals ?? DEFAULT_AUTO_APPROVALS}
        onApply={(value) => setOrderInstructions({ autoApprovals: value })}
      />
      <CameraCaptureSheet
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={onPhotoCaptured}
      />
      <DeleteItemDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        onConfirm={onConfirmDelete}
      />
    </OrderLayout>
  );
}
