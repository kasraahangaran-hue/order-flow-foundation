import { useRef, useState } from "react";
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

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function OrderInstructions() {
  const navigate = useNavigate();
  const orderInstructions = useOrderStore((s) => s.orderInstructions);
  const setOrderInstructions = useOrderStore((s) => s.setOrderInstructions);

  const specialRequests = orderInstructions?.specialRequests ?? "";
  const photos = orderInstructions?.photos ?? [];
  const folding = orderInstructions?.folding ?? null;
  const creases = orderInstructions?.creases ?? null;
  const starch = orderInstructions?.starch ?? null;
  const autoApprovals = orderInstructions?.autoApprovals ?? null;

  const [photoExpanded, setPhotoExpanded] = useState(false);
  const [creasesSheetOpen, setCreasesSheetOpen] = useState(false);
  const [starchSheetOpen, setStarchSheetOpen] = useState(false);
  const [foldingSheetOpen, setFoldingSheetOpen] = useState(false);
  const [autoApprovalsSheetOpen, setAutoApprovalsSheetOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const userPrefsFolding = useUserPrefsStore((s) => s.folding);
  const setUserPrefsFolding = useUserPrefsStore((s) => s.setFolding);

  const hasAnyInstruction =
    Boolean(specialRequests.trim()) ||
    photos.length > 0 ||
    Boolean(folding) ||
    Boolean(creases) ||
    Boolean(starch) ||
    Boolean(autoApprovals);

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Unexpected reader result"));
      };
      reader.onerror = () => reject(reader.error ?? new Error("Read error"));
      reader.readAsDataURL(file);
    });

  const onFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // Reset the input value so the same file can be picked again later
    event.target.value = "";
    if (files.length === 0) return;

    haptics.light();
    setPhotoError(null);

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setPhotoError("Please select an image file.");
      return;
    }

    const validFiles: File[] = [];
    let oversizeCount = 0;
    for (const file of imageFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        oversizeCount += 1;
      } else {
        validFiles.push(file);
      }
    }

    const remainingSlots = MAX_PHOTOS - photos.length;
    const filesToAdd = validFiles.slice(0, Math.max(0, remainingSlots));
    const droppedForCount = validFiles.length - filesToAdd.length;

    const errors: string[] = [];
    if (oversizeCount > 0) {
      errors.push(
        oversizeCount === 1
          ? "1 file was too large (max 5 MB)."
          : `${oversizeCount} files were too large (max 5 MB).`,
      );
    }
    if (droppedForCount > 0) {
      errors.push(`Only ${MAX_PHOTOS} photos allowed — extra files were skipped.`);
    }
    if (errors.length > 0) {
      setPhotoError(errors.join(" "));
    }

    if (filesToAdd.length === 0) return;

    try {
      const dataUrls = await Promise.all(filesToAdd.map(readFileAsDataURL));
      setOrderInstructions({ photos: [...photos, ...dataUrls] });
    } catch (err) {
      console.error("Failed to read photo file(s)", err);
      setPhotoError("Couldn't read the selected file(s). Please try again.");
    }
  };

  const removePhoto = (idx: number) => {
    haptics.light();
    setPhotoError(null);
    setOrderInstructions({ photos: photos.filter((_, i) => i !== idx) });
  };

  const togglePhotoCard = () => {
    haptics.light();
    setPhotoError(null);
    setPhotoExpanded((v) => !v);
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
        <div className="rounded-[8px] bg-white border border-[#f2f3f8] px-4 pt-[14px] pb-4">
          <p className="text-[14px] font-normal leading-[20px] tracking-[0.1px] text-washmen-primary">
            Any Special Requests?
          </p>
          <p className="mt-1 text-[12px] font-light leading-[18px] tracking-[0.1px] text-[#585871]">
            Your requests will be shared to the customer service team to action
          </p>
          <textarea
            value={specialRequests}
            onChange={(e) => setOrderInstructions({ specialRequests: e.target.value })}
            placeholder="Use fragrance-free detergent"
            className="mt-2 min-h-[80px] w-full rounded-[6px] border border-[#f2f3f8] bg-white p-3 text-[12px] font-light leading-[18px] tracking-[0.1px] text-foreground placeholder:text-[#c3c8db] focus:border-washmen-primary focus:outline-none focus:ring-2 focus:ring-washmen-primary/20"
          />
        </div>

        {/* 2. Send a Photo */}
        <div className="rounded-[8px] bg-white border border-[#f2f3f8]">
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
              <p className="text-[12px] font-light leading-[18px] tracking-[0.1px] text-[#585871]">
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
                  onClick={() => {
                    haptics.light();
                    fileInputRef.current?.click();
                  }}
                  disabled={photos.length >= MAX_PHOTOS}
                  className="press-effect flex h-20 w-20 items-center justify-center rounded-md border-2 border-dashed border-washmen-secondary-300 disabled:opacity-50"
                  aria-label="Attach photos"
                >
                  <Camera className="h-6 w-6 text-washmen-secondary-500" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onFilesSelected}
                />
              </div>
              {photoError ? (
                <p className="mt-2 text-[12px] font-light leading-[18px] text-red-500">
                  {photoError}
                </p>
              ) : null}
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
    </OrderLayout>
  );
}
