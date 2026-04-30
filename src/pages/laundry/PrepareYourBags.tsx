import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

// HANDOFF — Video assets:
// Each card below is currently a colored placeholder. In production these
// will be autoplay-muted-loop <video> elements. To wire:
//   - Replace the <div> placeholder with <video autoPlay muted loop playsInline />
//   - Set src to the marketing CDN URL for that card
//   - Keep the absolute-positioned tooltip overlay
// Expected aspect ratio per Figma: ~ 4/5 (portrait), full-width with
// horizontal page padding.
const CARDS: Array<{
  id: string;
  tooltip: string;
  placeholderBg: string;
}> = [
  {
    id: "any-bag",
    tooltip: "Any bag can be laundry bag",
    placeholderBg: "bg-washmen-secondary-100",
  },
  {
    id: "driver-pickup",
    tooltip: "Our driver will pick up",
    placeholderBg: "bg-washmen-light-aqua",
  },
];

const COUNTDOWN_SECONDS = 5;

export default function PrepareYourBags() {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Countdown — disables Got It for 5 seconds.
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const cardWidth = el.clientWidth;
    if (cardWidth === 0) return;
    const idx = Math.round(el.scrollLeft / cardWidth);
    if (idx !== activeCard) setActiveCard(idx);
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

        {/* Video carousel */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="no-scrollbar mt-4 -mx-6 flex snap-x snap-mandatory overflow-x-auto"
        >
          {CARDS.map((card) => (
            <div key={card.id} className="w-full shrink-0 snap-center px-6">
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-[16px]",
                  card.placeholderBg
                )}
                style={{ aspectRatio: "4 / 5" }}
              >
                {/* Placeholder play indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70">
                    <Play className="h-6 w-6 text-washmen-primary" />
                  </div>
                </div>

                {/* Tooltip overlay — bottom-left */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 shadow-md">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-washmen-primary text-[11px] font-bold text-white">
                    i
                  </span>
                  <span className="text-xs font-medium text-washmen-primary">
                    {card.tooltip}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {CARDS.map((card, idx) => (
            <span
              key={card.id}
              className={cn(
                "h-2 rounded-full transition-all",
                idx === activeCard
                  ? "w-2 bg-washmen-primary"
                  : "w-2 bg-washmen-secondary-300"
              )}
              aria-hidden
            />
          ))}
        </div>
      </main>

      {/* Footer */}
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
