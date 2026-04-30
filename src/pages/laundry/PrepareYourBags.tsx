import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";

const COUNTDOWN_SECONDS = 5;

export default function PrepareYourBags() {
  const navigate = useNavigate();
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);

  // 5-second countdown — disables Got It until the user has had time to
  // watch the video.
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const t = window.setTimeout(() => {
      setSecondsRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(t);
  }, [secondsRemaining]);

  const ctaEnabled = secondsRemaining === 0;
  const ctaLabel = ctaEnabled ? "Got It" : `Got It (${secondsRemaining}s)`;

  const handleBack = () => {
    haptics.light();
    navigate(-1);
  };

  const handleGotIt = () => {
    if (!ctaEnabled) return;
    haptics.medium();
    navigate("/laundry/select-service");
  };

  return (
    <div className="flex h-full min-h-screen flex-col bg-subtle-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-subtle-bg px-6 pt-6 pb-0">
        <h1 className="text-lg font-bold text-washmen-primary">
          Prepare Your Bags
        </h1>
      </header>

      {/* Body */}
      <main className="no-scrollbar flex-1 overflow-y-auto px-6 pb-4 pt-[26px]">
        {/* UAE flag info chip */}
        <div className="flex items-start gap-3 rounded-[12px] bg-washmen-secondary-express px-4 py-3">
          <span className="text-xl leading-none" aria-hidden>
            🇦🇪
          </span>
          <p className="text-sm leading-relaxed text-washmen-primary">
            Your bags are safe at your doorstep. Otherwise, you can meet the driver in person
          </p>
        </div>

        {/* HANDOFF — Video asset:
            This is currently a colored placeholder. In production this is
            an autoplay-muted-loop video that the user must watch for ~5s
            before they can dismiss the screen via Got It. To wire:
              - Replace the placeholder div with:
                <video autoPlay muted loop playsInline className="h-full w-full object-cover" src={cdnUrl} />
              - Get the asset URL from the marketing CDN.
              - The "Any bag can be laundry bag" / "Our driver will pick up"
                text overlays in the iOS reference are baked INTO the video
                content — do NOT render them as separate UI elements. */}
        <div
          className="relative mt-4 w-full overflow-hidden rounded-[16px] bg-washmen-secondary-100"
          style={{ aspectRatio: "4 / 5" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70">
              <Play className="h-6 w-6 text-washmen-primary" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-washmen-primary/60">
            [Video placeholder — production video plays here]
          </div>
        </div>
      </main>

      {/* Footer — matches the OrderLayout footer pattern */}
      <footer className="sticky bottom-0 z-10 bg-washmen-secondary-express pb-[max(env(safe-area-inset-bottom),1rem)] shadow-[0px_-1px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 px-6 pt-3 pb-4">
          <button
            type="button"
            aria-label="Go back"
            onClick={handleBack}
            className="press-effect flex w-12 h-[42px] shrink-0 items-center justify-center rounded-[8px] border border-primary bg-background text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Button
            className="flex-1 h-[42px] rounded-[8px] text-sm font-semibold"
            disabled={!ctaEnabled}
            onClick={handleGotIt}
          >
            {ctaLabel}
          </Button>
        </div>
      </footer>
    </div>
  );
}